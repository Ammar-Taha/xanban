#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_PRIORITIES = new Set(["none", "low", "medium", "high"]);

function isObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function ensureString(value, fallback = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  return fallback;
}

function ensureDate(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
}

function ensurePriority(value) {
  if (typeof value !== "string") return "none";
  const normalized = value.toLowerCase();
  return ALLOWED_PRIORITIES.has(normalized) ? normalized : "none";
}

function ensureBoolean(value) {
  return Boolean(value);
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    reset: args.has("--reset"),
    dryRun: args.has("--dry-run"),
  };
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

async function loadEnvFile(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex <= 0) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      const value = stripWrappingQuotes(trimmed.slice(eqIndex + 1).trim());
      if (!key || process.env[key] != null) continue;
      process.env[key] = value;
    }
  } catch (error) {
    // Ignore missing env files; callers may provide vars via shell/CI.
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function countSeed(seed) {
  let boardCount = 0;
  let columnCount = 0;
  let cardCount = 0;
  let subtaskCount = 0;

  for (const board of seed.boards ?? []) {
    boardCount += 1;
    for (const column of board.columns ?? []) {
      columnCount += 1;
      const cards = Array.isArray(column.cards)
        ? column.cards
        : Array.isArray(column.tasks)
          ? column.tasks
          : [];
      for (const task of cards) {
        cardCount += 1;
        subtaskCount += (task.subtasks ?? []).length;
      }
    }
  }

  return {
    labels: (seed.labels ?? []).length,
    boards: boardCount,
    columns: columnCount,
    cards: cardCount,
    subtasks: subtaskCount,
  };
}

async function loadSeedFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!isObject(parsed) || !Array.isArray(parsed.boards)) {
    throw new Error("Invalid data.json format: expected an object with a boards array.");
  }

  return parsed;
}

function resolveEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.SUPABASE_SEED_EMAIL;
  const password = process.env.SUPABASE_SEED_PASSWORD;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  if (!email || !password) {
    throw new Error("Missing SUPABASE_SEED_EMAIL or SUPABASE_SEED_PASSWORD.");
  }

  return { url, anonKey, email, password };
}

function getOrDefaultPosition(value, fallback) {
  return Number.isInteger(value) ? value : fallback;
}

function extractMissingColumn(message) {
  if (typeof message !== "string") return null;
  const match = message.match(/Could not find the '([^']+)' column/i);
  return match?.[1] ?? null;
}

async function insertWithColumnFallback({
  supabase,
  table,
  payload,
  select = "id",
  context,
  droppedColumnsByTable,
}) {
  const candidate = { ...payload };

  // Retry when PostgREST says a column is missing in the schema cache.
  // This keeps seeding compatible with older DB revisions.
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .insert(candidate)
      .select(select)
      .single();

    if (!error) return data;

    const missingColumn = extractMissingColumn(error.message);
    if (missingColumn && Object.prototype.hasOwnProperty.call(candidate, missingColumn)) {
      delete candidate[missingColumn];
      if (!droppedColumnsByTable[table]) droppedColumnsByTable[table] = new Set();
      droppedColumnsByTable[table].add(missingColumn);
      continue;
    }

    throw new Error(`Failed to create ${context}: ${error.message ?? "unknown error"}`);
  }
}

async function getOrCreateLabelId(supabase, userId, labelName, color, labelMap) {
  const key = labelName.toLowerCase();
  if (labelMap.has(key)) return labelMap.get(key);

  const { data, error } = await supabase
    .from("labels")
    .insert({
      user_id: userId,
      name: labelName,
      color: color ?? null,
    })
    .select("id, name")
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to create label '${labelName}': ${error?.message ?? "unknown error"}`);
  }

  labelMap.set(key, data.id);
  return data.id;
}

async function main() {
  const { reset, dryRun } = parseArgs(process.argv);
  await loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  await loadEnvFile(path.resolve(process.cwd(), ".env"));
  const seedPath = path.resolve(process.cwd(), "data.json");
  const seed = await loadSeedFile(seedPath);
  const counts = countSeed(seed);

  if (dryRun) {
    console.log("Dry run: parsed seed payload.");
    console.log(JSON.stringify(counts, null, 2));
    return;
  }

  const { url, anonKey, email, password } = resolveEnv();
  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user?.id) {
    throw new Error(`Auth failed: ${authError?.message ?? "no authenticated user"}`);
  }

  const userId = authData.user.id;

  if (reset) {
    const { error: boardsDeleteError } = await supabase
      .from("boards")
      .delete()
      .eq("user_id", userId);

    if (boardsDeleteError) {
      throw new Error(`Failed to reset boards: ${boardsDeleteError.message}`);
    }

    const { error: labelsDeleteError } = await supabase
      .from("labels")
      .delete()
      .eq("user_id", userId);

    if (labelsDeleteError) {
      throw new Error(`Failed to reset labels: ${labelsDeleteError.message}`);
    }
  }

  const labelMap = new Map();

  const { data: existingLabels, error: existingLabelsError } = await supabase
    .from("labels")
    .select("id, name")
    .eq("user_id", userId);

  if (existingLabelsError) {
    throw new Error(`Failed to load existing labels: ${existingLabelsError.message}`);
  }

  for (const row of existingLabels ?? []) {
    if (row?.name && row?.id) {
      labelMap.set(row.name.toLowerCase(), row.id);
    }
  }

  for (const label of seed.labels ?? []) {
    const name = ensureString(label?.name);
    if (!name) continue;
    await getOrCreateLabelId(supabase, userId, name, label?.color ?? null, labelMap);
  }

  const stats = {
    boards: 0,
    columns: 0,
    cards: 0,
    subtasks: 0,
    cardLabels: 0,
    labels: labelMap.size,
  };
  const droppedColumnsByTable = {};

  for (let boardIndex = 0; boardIndex < (seed.boards ?? []).length; boardIndex += 1) {
    const board = seed.boards[boardIndex] ?? {};
    const boardName = ensureString(board.name, `Board ${boardIndex + 1}`);

    const boardRow = await insertWithColumnFallback({
      supabase,
      table: "boards",
      payload: {
        user_id: userId,
        name: boardName,
        position: getOrDefaultPosition(board.position, boardIndex),
      },
      context: `board '${boardName}'`,
      droppedColumnsByTable,
    });
    if (!boardRow?.id) throw new Error(`Failed to create board '${boardName}': no id returned`);
    stats.boards += 1;

    const columns = Array.isArray(board.columns) ? board.columns : [];

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
      const column = columns[columnIndex] ?? {};
      const columnName = ensureString(column.name, `Column ${columnIndex + 1}`);

      const columnRow = await insertWithColumnFallback({
        supabase,
        table: "columns",
        payload: {
          board_id: boardRow.id,
          name: columnName,
          position: getOrDefaultPosition(column.position, columnIndex),
          wip_limit: Number.isInteger(column.wip_limit) ? column.wip_limit : null,
          color: ensureString(column.color, "") || null,
        },
        context: `column '${columnName}' on '${boardName}'`,
        droppedColumnsByTable,
      });
      if (!columnRow?.id) throw new Error(`Failed to create column '${columnName}' on '${boardName}': no id returned`);
      stats.columns += 1;

      const tasks = Array.isArray(column.cards)
        ? column.cards
        : Array.isArray(column.tasks)
          ? column.tasks
          : [];

      for (let taskIndex = 0; taskIndex < tasks.length; taskIndex += 1) {
        const task = tasks[taskIndex] ?? {};
        const taskTitle = ensureString(task.title, `Task ${taskIndex + 1}`);

        const cardRow = await insertWithColumnFallback({
          supabase,
          table: "cards",
          payload: {
            column_id: columnRow.id,
            title: taskTitle,
            description: ensureString(task.description),
            due_date: ensureDate(task.due_date),
            priority: ensurePriority(task.priority),
            position: getOrDefaultPosition(task.position, taskIndex),
            is_archived: ensureBoolean(task.is_archived),
          },
          context: `card '${taskTitle}'`,
          droppedColumnsByTable,
        });
        if (!cardRow?.id) throw new Error(`Failed to create card '${taskTitle}': no id returned`);
        stats.cards += 1;

        const labelNames = Array.isArray(task.label_names)
          ? [...new Set(task.label_names.map((label) => ensureString(label)).filter(Boolean))]
          : [];

        for (const labelName of labelNames) {
          const labelId = await getOrCreateLabelId(supabase, userId, labelName, null, labelMap);
          const { error: cardLabelError } = await supabase.from("card_labels").insert({
            card_id: cardRow.id,
            label_id: labelId,
          });
          if (cardLabelError) {
            throw new Error(`Failed to map label '${labelName}' on card '${taskTitle}': ${cardLabelError.message}`);
          }
          stats.cardLabels += 1;
        }

        const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
        if (subtasks.length > 0) {
          const rows = subtasks.map((subtask, subtaskIndex) => ({
            card_id: cardRow.id,
            title: ensureString(subtask?.title, `Subtask ${subtaskIndex + 1}`),
            is_completed: ensureBoolean(subtask?.is_completed),
            position: getOrDefaultPosition(subtask?.position, subtaskIndex),
          }));

          const { error: subtasksError } = await supabase.from("subtasks").insert(rows);
          if (subtasksError) {
            throw new Error(`Failed to create subtasks for '${taskTitle}': ${subtasksError.message}`);
          }
          stats.subtasks += rows.length;
        }
      }
    }
  }

  await supabase.auth.signOut();

  console.log("Seed completed successfully.");
  console.log(JSON.stringify(stats, null, 2));
  const droppedEntries = Object.entries(droppedColumnsByTable);
  if (droppedEntries.length > 0) {
    console.warn("Seed used compatibility fallback (missing columns in DB schema cache):");
    for (const [table, colsSet] of droppedEntries) {
      console.warn(`- ${table}: ${[...colsSet].join(", ")}`);
    }
    console.warn("Run supabase/schema.sql to align your DB and remove this fallback behavior.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
