"use client";

import { LabelChip } from "@/components/board/label-chip";
import { formatDueDate, isOverdue, PRIORITY_STYLES, type CardPriority } from "@/lib/card-meta";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Label } from "@/lib/labels";
import { Calendar, ChevronDown, MoreVertical, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ColumnOption = { id: string; name: string; position: number };
type SubtaskRow = { id: string; title: string; is_completed: boolean; position: number };

type ViewTaskModalProps = {
  open: boolean;
  onClose: () => void;
  cardId: string | null;
  boardId: string | null;
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string, title: string) => void;
  onArchive?: (cardId: string) => void;
  onTaskChanged?: () => void;
};

export function ViewTaskModal({
  open,
  onClose,
  cardId,
  boardId,
  onEdit,
  onDelete,
  onArchive,
  onTaskChanged,
}: ViewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState<SubtaskRow[]>([]);
  const [columnId, setColumnId] = useState("");
  const [columns, setColumns] = useState<ColumnOption[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<CardPriority>("none");
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTask = useCallback(async () => {
    if (!cardId || !open) return;
    setLoading(true);
    const supabase = createClient();
    const { data: card } = (await supabase
      .from("cards")
      .select("id, title, description, column_id, due_date, priority")
      .eq("id", cardId)
      .single()) as { data: { title: string; description: string | null; column_id: string; due_date: string | null; priority: string | null } | null };
    if (!card) {
      setLoading(false);
      return;
    }
    setTitle(card.title);
    setDescription(card.description ?? "");
    setColumnId(card.column_id);
    setDueDate(card.due_date ?? null);
    setPriority((card.priority as CardPriority) ?? "none");
    const { data: subs } = (await supabase
      .from("subtasks")
      .select("id, title, is_completed, position")
      .eq("card_id", cardId)
      .order("position", { ascending: true })) as { data: SubtaskRow[] | null };
    setSubtasks(subs ?? []);
    const { data: labelLinks } = (await supabase
      .from("card_labels")
      .select("label_id")
      .eq("card_id", cardId)) as { data: { label_id: string }[] | null };
    const ids = (labelLinks ?? []).map((r) => r.label_id);
    if (ids.length > 0) {
      const { data: labelData } = (await supabase
        .from("labels")
        .select("id, user_id, name, color, created_at")
        .in("id", ids)) as { data: Label[] | null };
      setLabels(labelData ?? []);
    } else {
      setLabels([]);
    }
    setLoading(false);
  }, [cardId, open]);

  const fetchColumns = useCallback(async () => {
    if (!boardId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("columns")
      .select("id, name, position")
      .eq("board_id", boardId)
      .order("position", { ascending: true });
    setColumns((data ?? []) as ColumnOption[]);
  }, [boardId]);

  useEffect(() => {
    if (open && cardId) fetchTask();
  }, [open, cardId, fetchTask]);
  useEffect(() => {
    if (open && boardId) fetchColumns();
  }, [open, boardId, fetchColumns]);

  const toggleSubtask = useCallback(
    async (subtaskId: string, is_completed: boolean) => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never
      await (supabase.from("subtasks") as any).update({ is_completed }).eq("id", subtaskId);
      setSubtasks((prev) =>
        prev.map((s) => (s.id === subtaskId ? { ...s, is_completed } : s))
      );
      onTaskChanged?.();
    },
    [onTaskChanged]
  );

  const changeStatus = useCallback(
    async (newColumnId: string) => {
      if (newColumnId === columnId) return;
      const supabase = createClient();
      const { data: maxPos } = (await supabase
        .from("cards")
        .select("position")
        .eq("column_id", newColumnId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle()) as { data: { position: number } | null };
      const nextPosition = maxPos?.position != null ? maxPos.position + 1 : 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never
      await (supabase.from("cards") as any)
        .update({ column_id: newColumnId, position: nextPosition })
        .eq("id", cardId!);
      setColumnId(newColumnId);
      onTaskChanged?.();
    },
    [cardId, columnId, onTaskChanged]
  );

  const handleEdit = useCallback(() => {
    setMenuOpen(false);
    onClose();
    if (cardId) onEdit(cardId);
  }, [cardId, onClose, onEdit]);

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    onClose();
    if (cardId && title) onDelete(cardId, title);
  }, [cardId, title, onClose, onDelete]);

  const handleArchive = useCallback(() => {
    setMenuOpen(false);
    onClose();
    if (cardId && onArchive) onArchive(cardId);
  }, [cardId, onClose, onArchive]);

  if (!open) return null;

  const completedCount = subtasks.filter((s) => s.is_completed).length;
  const selectedColumn = columns.find((c) => c.id === columnId);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" aria-hidden onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="view-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-xanban-primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h2
                id="view-task-title"
                className="min-w-0 flex-1 text-[18px] font-bold leading-[1.26] text-[var(--board-text)]"
              >
                {title}
              </h2>
              <div className="flex shrink-0 items-center gap-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="rounded p-1 text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
                    aria-label="Task menu"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] py-2 shadow-lg">
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="w-full px-4 py-2 text-left text-[13px] font-medium text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                      >
                        Edit Task
                      </button>
                      {onArchive && (
                        <button
                          type="button"
                          onClick={handleArchive}
                          className="w-full px-4 py-2 text-left text-[13px] font-medium text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                        >
                            Archive
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-[13px] font-medium text-[#EA5555] hover:bg-[#EA5555]/10"
                      >
                        Delete Task
                      </button>
                    </div>
                  </>
                )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1 text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {description && (
              <p className="mt-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text-muted)]">
                {description}
              </p>
            )}

            {labels.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {labels.map((l) => (
                  <LabelChip key={l.id} name={l.name} color={l.color} small />
                ))}
              </div>
            )}

            {(dueDate || priority !== "none") && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--board-text-muted)]" />
                    <span
                      className={cn(
                        "text-[13px] font-medium",
                        isOverdue(dueDate) ? "text-[#EA5555]" : "text-[var(--board-text-muted)]"
                      )}
                    >
                      Due {formatDueDate(dueDate)}
                      {isOverdue(dueDate) && " (overdue)"}
                    </span>
                  </div>
                )}
                {priority !== "none" && (
                  <span className={cn("text-[13px] font-medium capitalize", PRIORITY_STYLES[priority])}>
                    {priority} priority
                  </span>
                )}
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
                Subtasks ({completedCount} of {subtasks.length})
              </h3>
              <div className="mt-3 space-y-2">
                {subtasks.map((st) => (
                  <label
                    key={st.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border border-[var(--board-line)] bg-[var(--board-bg)] px-4 py-3 transition-colors hover:bg-[var(--board-line)]/30",
                      st.is_completed && "opacity-75"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={st.is_completed}
                      onChange={(e) => toggleSubtask(st.id, e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--board-line)] text-[#635FC7] focus:ring-[#635FC7]"
                    />
                    <span
                      className={cn(
                        "text-[13px] font-medium",
                        st.is_completed
                          ? "text-[var(--board-text-muted)] line-through"
                          : "text-[var(--board-text)]"
                      )}
                    >
                      {st.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
                Current Status
              </h3>
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setStatusOpen((o) => !o)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium text-[var(--board-text)]"
                >
                  <span>{selectedColumn?.name ?? "Select"}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </button>
                {statusOpen && (
                  <>
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setStatusOpen(false)} />
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] py-1 shadow-lg">
                      {columns.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            changeStatus(col.id);
                            setStatusOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-[13px] font-medium text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                        >
                          {col.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
