import type { createClient } from "@/lib/supabase/client";

export type SearchScope = "current" | "all";

export type SearchResultItem = {
  id: string;
  title: string;
  description: string | null;
  board_id: string;
  board_name: string;
  column_name: string;
};

/**
 * Search tasks by title and description across the user's boards.
 * Uses separate title/description ilike queries and merges to avoid .or() escaping issues.
 */
export async function searchTasks(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  query: string,
  scope: SearchScope,
  currentBoardId: string | null,
  boardIds: string[]
): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  const boardIdsToSearch =
    scope === "current" && currentBoardId ? [currentBoardId] : boardIds;
  if (boardIdsToSearch.length === 0) return [];

  const { data: columns } = (await supabase
    .from("columns")
    .select("id, name, board_id")
    .in("board_id", boardIdsToSearch)) as {
    data: { id: string; name: string; board_id: string }[] | null;
  };

  const columnList = columns ?? [];
  const columnIds = columnList.map((c) => c.id);
  if (columnIds.length === 0) return [];

  const colById = new Map(columnList.map((c) => [c.id, c]));

  const { data: boardsData } = (await supabase
    .from("boards")
    .select("id, name")
    .eq("user_id", userId)
    .in("id", boardIdsToSearch)) as {
    data: { id: string; name: string }[] | null;
  };
  const boardNames = new Map((boardsData ?? []).map((b) => [b.id, b.name]));

  const pattern = `%${q}%`;
  type CardRow = { id: string; title: string; description: string | null; column_id: string };

  const [byTitle, byDesc] = await Promise.all([
    (supabase
      .from("cards")
      .select("id, title, description, column_id")
      .in("column_id", columnIds)
      .ilike("title", pattern)) as Promise<{ data: CardRow[] | null }>,
    (supabase
      .from("cards")
      .select("id, title, description, column_id")
      .in("column_id", columnIds)
      .ilike("description", pattern)) as Promise<{ data: CardRow[] | null }>,
  ]);

  const seen = new Set<string>();
  const cardList: CardRow[] = [];
  for (const row of byTitle.data ?? []) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      cardList.push(row);
    }
  }
  for (const row of byDesc.data ?? []) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      cardList.push(row);
    }
  }

  return cardList.map((card) => {
    const col = colById.get(card.column_id);
    const boardId = col?.board_id ?? "";
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      board_id: boardId,
      board_name: boardNames.get(boardId) ?? "Board",
      column_name: col?.name ?? "",
    };
  });
}
