"use client";

import { LabelChip } from "@/components/board/label-chip";
import { formatDueDate, isOverdue, PRIORITY_STYLES, type CardPriority } from "@/lib/card-meta";
import { useTaskModals } from "@/components/board/task-modals-context";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Label } from "@/lib/labels";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const COLUMN_DOT_COLORS = [
  "bg-[#49C4E5]",
  "bg-[#635FC7]",
  "bg-[#67E2AE]",
];

type Column = {
  id: string;
  name: string;
  position: number;
};

type Card = {
  id: string;
  column_id: string;
  title: string;
  position: number;
  due_date?: string | null;
  priority?: string | null;
};

type SubtaskCount = { total: number; completed: number };

function CardContent({
  card,
  subtaskCount,
  labels,
  className,
}: {
  card: Card;
  subtaskCount?: SubtaskCount | null;
  labels?: Label[];
  className?: string;
}) {
  const due = card.due_date ?? null;
  const priority = (card.priority as CardPriority) ?? "none";
  const overdue = due ? isOverdue(due) : false;

  return (
    <div className={cn("rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 py-3 shadow-sm", className)}>
      {labels && labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {labels.map((l) => (
            <LabelChip key={l.id} name={l.name} color={l.color} small />
          ))}
        </div>
      )}
      <p className="text-[15px] font-medium leading-[1.26] text-[var(--board-text)]">
        {card.title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {due && (
          <span
            className={cn(
              "text-[11px] font-medium",
              overdue ? "text-[#EA5555]" : "text-[var(--board-text-muted)]"
            )}
          >
            {formatDueDate(due)}
            {overdue && " (overdue)"}
          </span>
        )}
        {priority !== "none" && (
          <span className={cn("text-[11px] font-medium capitalize", PRIORITY_STYLES[priority])}>
            {priority}
          </span>
        )}
        {subtaskCount && subtaskCount.total > 0 && (
          <span className="text-[12px] font-medium text-[var(--board-text-muted)]">
            {subtaskCount.completed}/{subtaskCount.total} subtasks
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  card,
  subtaskCount,
  labels,
  onOpen,
}: {
  card: Card;
  subtaskCount: SubtaskCount | undefined;
  labels: Label[];
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onOpen(card.id);
        }}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-xanban-primary)] focus-visible:ring-offset-2 rounded-lg"
      >
        <CardContent card={card} subtaskCount={subtaskCount} labels={labels} className="hover:border-[var(--color-xanban-primary)]/50 hover:shadow-md transition-colors" />
      </button>
    </div>
  );
}

export function BoardColumnsView({
  boardId,
  onAddColumn,
}: {
  boardId: string;
  onAddColumn?: () => void;
}) {
  const { user } = useAuth();
  const { setViewCardId } = useTaskModals();
  const [columns, setColumns] = useState<Column[]>([]);
  const [cardsByColumn, setCardsByColumn] = useState<Record<string, Card[]>>({});
  const [subtasksByCard, setSubtasksByCard] = useState<Record<string, SubtaskCount>>({});
  const [labelsByCard, setLabelsByCard] = useState<Record<string, Label[]>>({});
  const [userLabels, setUserLabels] = useState<Label[]>([]);
  const [filterLabelId, setFilterLabelId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"position" | "due_date" | "priority">("position");
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const fetchColumnsAndCards = useCallback(async () => {
    if (!boardId) return;
    const supabase = createClient();
    const { data: cols } = await supabase
      .from("columns")
      .select("id, name, position")
      .eq("board_id", boardId)
      .order("position", { ascending: true });
    const columnList = (cols ?? []) as Column[];
    setColumns(columnList);

    if (columnList.length === 0) {
      setCardsByColumn({});
      setSubtasksByCard({});
      setLoading(false);
      return;
    }

    const columnIds = columnList.map((c) => c.id);
    const { data: cardsData } = await supabase
      .from("cards")
      .select("id, column_id, title, position, due_date, priority")
      .in("column_id", columnIds)
      .eq("is_archived", false)
      .order("position", { ascending: true });
    const cards = (cardsData ?? []) as Card[];
    const byColumn: Record<string, Card[]> = {};
    columnIds.forEach((id) => (byColumn[id] = []));
    cards.forEach((card) => {
      if (byColumn[card.column_id]) byColumn[card.column_id].push(card);
    });
    setCardsByColumn(byColumn);

    const cardIds = cards.map((c) => c.id);
    if (cardIds.length > 0) {
      const { data: subtasksData } = await supabase
        .from("subtasks")
        .select("card_id, is_completed")
        .in("card_id", cardIds);
      const subs = (subtasksData ?? []) as { card_id: string; is_completed: boolean }[];
      const byCard: Record<string, SubtaskCount> = {};
      cardIds.forEach((id) => (byCard[id] = { total: 0, completed: 0 }));
      subs.forEach((s) => {
        if (byCard[s.card_id]) {
          byCard[s.card_id].total += 1;
          if (s.is_completed) byCard[s.card_id].completed += 1;
        }
      });
      setSubtasksByCard(byCard);

      const { data: clData } = (await supabase
        .from("card_labels")
        .select("card_id, label_id")
        .in("card_id", cardIds)) as { data: { card_id: string; label_id: string }[] | null };
      const labelIds = [...new Set((clData ?? []).map((r) => r.label_id))];
      let labelList: Label[] = [];
      if (labelIds.length > 0) {
        const { data: labelData } = (await supabase
          .from("labels")
          .select("id, user_id, name, color, created_at")
          .in("id", labelIds)) as { data: Label[] | null };
        labelList = labelData ?? [];
      }
      const byCardLabels: Record<string, Label[]> = {};
      cardIds.forEach((id) => (byCardLabels[id] = []));
      (clData ?? []).forEach((r) => {
        const label = labelList.find((l) => l.id === r.label_id);
        if (label && byCardLabels[r.card_id]) byCardLabels[r.card_id].push(label);
      });
      setLabelsByCard(byCardLabels);
    } else {
      setSubtasksByCard({});
      setLabelsByCard({});
    }

    if (user?.id) {
      const { data: ul } = (await supabase
        .from("labels")
        .select("id, user_id, name, color, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })) as { data: Label[] | null };
      setUserLabels(ul ?? []);
    } else {
      setUserLabels([]);
    }
    setLoading(false);
  }, [boardId, user?.id]);

  useEffect(() => {
    fetchColumnsAndCards();
  }, [fetchColumnsAndCards]);

  const getColumnIdForCard = useCallback(
    (cardId: string): string | null => {
      for (const [colId, cards] of Object.entries(cardsByColumn)) {
        if (cards.some((c) => c.id === cardId)) return colId;
      }
      return null;
    },
    [cardsByColumn]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const cardId = event.active.id as string;
    for (const cards of Object.values(cardsByColumn)) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        setActiveCard(card);
        return;
      }
    }
  }, [cardsByColumn]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveCard(null);
      const { active, over } = event;
      if (!over?.id) return;
      const cardId = active.id as string;
      let targetColumnId: string | null = null;
      if (columns.some((c) => c.id === over.id)) {
        targetColumnId = over.id as string;
      } else {
        targetColumnId = getColumnIdForCard(over.id as string);
      }
      if (!targetColumnId) return;
      const sourceColumnId = getColumnIdForCard(cardId);
      if (!sourceColumnId || sourceColumnId === targetColumnId) return;

      const targetCards = cardsByColumn[targetColumnId] ?? [];
      const nextPosition = targetCards.length;

      setCardsByColumn((prev) => {
        const next = { ...prev };
        next[sourceColumnId] = (next[sourceColumnId] ?? []).filter((c) => c.id !== cardId);
        const card = (prev[sourceColumnId] ?? []).find((c) => c.id === cardId);
        if (!card) return prev;
        const newCard = { ...card, column_id: targetColumnId, position: nextPosition };
        next[targetColumnId] = [...(next[targetColumnId] ?? []), newCard];
        return next;
      });

      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never
      await (supabase.from("cards") as any)
        .update({ column_id: targetColumnId, position: nextPosition })
        .eq("id", cardId);
    },
    [columns, cardsByColumn, getColumnIdForCard]
  );

  const filterCardsByLabel = useCallback(
    (columnCards: Card[]) => {
      if (!filterLabelId) return columnCards;
      return columnCards.filter((card) => {
        const labels = labelsByCard[card.id] ?? [];
        return labels.some((l) => l.id === filterLabelId);
      });
    },
    [filterLabelId, labelsByCard]
  );

  const sortCards = useCallback(
    (columnCards: Card[]) => {
      if (sortBy === "position") return columnCards;
      const copy = [...columnCards];
      if (sortBy === "due_date") {
        copy.sort((a, b) => {
          const ad = a.due_date ?? "";
          const bd = b.due_date ?? "";
          if (!ad && !bd) return 0;
          if (!ad) return 1;
          if (!bd) return -1;
          return ad.localeCompare(bd);
        });
      } else {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 };
        copy.sort((a, b) => {
          const ap = order[(a.priority as string) ?? "none"] ?? 3;
          const bp = order[(b.priority as string) ?? "none"] ?? 3;
          return ap - bp;
        });
      }
      return copy;
    },
    [sortBy]
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-xanban-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-[var(--board-line)] bg-[var(--board-header-bg)] px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[var(--board-text-muted)]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "position" | "due_date" | "priority")}
              className="rounded border border-[var(--board-line)] bg-[var(--board-bg)] px-2 py-1.5 text-[12px] font-medium text-[var(--board-text)] focus:border-[#635FC7] focus:outline-none"
            >
              <option value="position">Default</option>
              <option value="due_date">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        {userLabels.length > 0 && (
          <>
            <span className="text-[12px] font-bold text-[var(--board-text-muted)]">Filter:</span>
            <button
              type="button"
              onClick={() => setFilterLabelId(null)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                !filterLabelId
                  ? "bg-[var(--color-xanban-primary)] text-white"
                  : "bg-[var(--board-bg)] text-[var(--board-text)] hover:bg-[var(--board-line)]"
              )}
            >
              All
            </button>
            {userLabels.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setFilterLabelId(filterLabelId === l.id ? null : l.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition-opacity",
                  filterLabelId === l.id ? "ring-2 ring-[var(--color-xanban-primary)] ring-offset-2" : "opacity-90 hover:opacity-100"
                )}
                style={{ backgroundColor: l.color ?? "var(--board-line)", color: l.color && ["#F2C94C", "#67E2AE", "#49C4E5", "#FF9F1A"].includes(l.color) ? "#000" : "#fff" }}
              >
                {l.name}
              </button>
            ))}
          </>
        )}
        </div>
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full min-w-min gap-6">
          {columns.map((col, index) => (
            <ColumnDropZone
              key={col.id}
              column={col}
              columnIndex={index}
              cards={sortCards(filterCardsByLabel(cardsByColumn[col.id] ?? []))}
              subtasksByCard={subtasksByCard}
              labelsByCard={labelsByCard}
              onCardClick={setViewCardId}
            />
          ))}
          <button
            type="button"
            onClick={onAddColumn}
            className="flex min-h-[calc(100vh-12rem)] w-[280px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--board-line)] bg-[var(--board-bg)] text-[var(--board-text-muted)] transition-colors hover:border-[var(--color-xanban-primary)] hover:bg-[var(--board-bg)] hover:text-[var(--color-xanban-primary)]"
          >
            <Plus className="h-8 w-8" />
            <span className="text-[15px] font-bold leading-[1.26]">New Column</span>
          </button>
        </div>
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <CardContent
            card={activeCard}
            subtaskCount={subtasksByCard[activeCard.id]}
            labels={labelsByCard[activeCard.id]}
            className="cursor-grabbing shadow-lg opacity-95 w-[260px]"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function ColumnDropZone({
  column,
  columnIndex,
  cards,
  subtasksByCard,
  labelsByCard,
  onCardClick,
}: {
  column: Column;
  columnIndex: number;
  cards: Card[];
  subtasksByCard: Record<string, SubtaskCount>;
  labelsByCard: Record<string, Label[]>;
  onCardClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-lg bg-[var(--board-bg)] transition-colors",
        isOver && "ring-2 ring-[var(--color-xanban-primary)] ring-offset-2 ring-offset-[var(--board-bg)]"
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            "h-3 w-3 shrink-0 rounded-full",
            COLUMN_DOT_COLORS[columnIndex % COLUMN_DOT_COLORS.length]
          )}
        />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--board-text-muted)]">
          {column.name} ({cards.length})
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-[80px]">
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            subtaskCount={subtasksByCard[card.id]}
            labels={labelsByCard[card.id] ?? []}
            onOpen={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}
