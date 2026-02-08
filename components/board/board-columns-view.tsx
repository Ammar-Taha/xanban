"use client";

import { useTaskModals } from "@/components/board/task-modals-context";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const COLUMN_DOT_COLORS = [
  "bg-[#49C4E5]", // light blue
  "bg-[#635FC7]", // purple
  "bg-[#67E2AE]", // green
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
};

type SubtaskCount = { total: number; completed: number };

export function BoardColumnsView({
  boardId,
  onAddColumn,
}: {
  boardId: string;
  onAddColumn?: () => void;
}) {
  const { setViewCardId } = useTaskModals();
  const [columns, setColumns] = useState<Column[]>([]);
  const [cardsByColumn, setCardsByColumn] = useState<Record<string, Card[]>>({});
  const [subtasksByCard, setSubtasksByCard] = useState<Record<string, SubtaskCount>>({});
  const [loading, setLoading] = useState(true);

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
      .select("id, column_id, title, position")
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
    } else {
      setSubtasksByCard({});
    }
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    fetchColumnsAndCards();
  }, [fetchColumnsAndCards]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-xanban-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex h-full min-w-min gap-6">
        {columns.map((col, index) => (
          <div
            key={col.id}
            className="flex w-[280px] shrink-0 flex-col rounded-lg bg-[var(--board-bg)]"
          >
            <div className="mb-4 flex items-center gap-2">
              <span
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full",
                  COLUMN_DOT_COLORS[index % COLUMN_DOT_COLORS.length]
                )}
              />
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--board-text-muted)]">
                {col.name} ({(cardsByColumn[col.id] ?? []).length})
              </h3>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
              {(cardsByColumn[col.id] ?? []).map((card) => {
                const st = subtasksByCard[card.id];
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setViewCardId(card.id)}
                    className="w-full rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 py-3 text-left shadow-sm transition-colors hover:border-[var(--color-xanban-primary)]/50 hover:shadow-md"
                  >
                    <p className="text-[15px] font-medium leading-[1.26] text-[var(--board-text)]">
                      {card.title}
                    </p>
                    {st && st.total > 0 && (
                      <p className="mt-2 text-[12px] font-medium text-[var(--board-text-muted)]">
                        {st.completed} of {st.total} substasks
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {/* + New Column */}
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
  );
}
