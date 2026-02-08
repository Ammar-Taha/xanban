"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ColumnOption = { id: string; name: string; position: number };

type AddNewTaskModalProps = {
  open: boolean;
  onClose: () => void;
  boardId: string | null;
  onTaskCreated?: () => void;
};

export function AddNewTaskModal({
  open,
  onClose,
  boardId,
  onTaskCreated,
}: AddNewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>(["", ""]);
  const [statusId, setStatusId] = useState<string>("");
  const [columns, setColumns] = useState<ColumnOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const fetchColumns = useCallback(async () => {
    if (!boardId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("columns")
      .select("id, name, position")
      .eq("board_id", boardId)
      .order("position", { ascending: true });
    const list = (data ?? []) as ColumnOption[];
    setColumns(list);
    if (list.length > 0) setStatusId(list[0].id);
  }, [boardId]);

  useEffect(() => {
    if (open && boardId) fetchColumns();
  }, [open, boardId, fetchColumns]);

  const addSubtask = useCallback(() => {
    setSubtasks((prev) => [...prev, ""]);
  }, []);

  const removeSubtask = useCallback((index: number) => {
    setSubtasks((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const setSubtaskAt = useCallback((index: number, value: string) => {
    setSubtasks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setSubtasks(["", ""]);
    setError(null);
    if (columns.length > 0) setStatusId(columns[0].id);
  }, [columns.length]);

  const handleClose = useCallback(() => {
    resetForm();
    setStatusOpen(false);
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("Title is required.");
        return;
      }
      if (!statusId) {
        setError("Please select a status (column).");
        return;
      }

      setIsSubmitting(true);
      const supabase = createClient();

      try {
        const { data: maxPos } = (await supabase
          .from("cards")
          .select("position")
          .eq("column_id", statusId)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle()) as { data: { position: number } | null };
        const nextPosition =
          maxPos?.position != null ? maxPos.position + 1 : 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never when Database type is incomplete
        const { data: cardData, error: cardError } = (await supabase
          .from("cards")
          .insert({
            column_id: statusId,
            title: trimmedTitle,
            description: description.trim() || "",
            position: nextPosition,
          } as any)
          .select("id")
          .single()) as { data: { id: string } | null; error: { message: string } | null };

        if (cardError) {
          setError(cardError.message || "Failed to create task.");
          return;
        }
        const cardId = cardData?.id;
        if (!cardId) {
          setError("Failed to create task.");
          return;
        }

        const subtaskTitles = subtasks.map((s) => s.trim()).filter(Boolean);
        if (subtaskTitles.length > 0) {
          const rows = subtaskTitles.map((title, position) => ({
            card_id: cardId,
            title,
            position,
          }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never when Database type is incomplete
          const { error: subsError } = (await supabase
            .from("subtasks")
            .insert(rows as any)) as { error: { message: string } | null };
          if (subsError) setError(subsError.message || "Task created but subtasks failed.");
        }

        resetForm();
        handleClose();
        onTaskCreated?.();
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, description, subtasks, statusId, resetForm, handleClose, onTaskCreated]
  );

  if (!open) return null;

  const selectedColumn = columns.find((c) => c.id === statusId);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
        onClick={handleClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="add-new-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="add-new-task-title"
            className="text-[18px] font-bold leading-[1.26] text-[var(--board-text)]"
          >
            Add New Task
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="task-title"
              className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Take coffee break."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="task-description"
              className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 py-3 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
              Subtasks
            </label>
            <div className="space-y-3">
              {subtasks.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={
                      index === 0
                        ? "e.g. Make coffee."
                        : "e.g. Drink coffee & smile."
                    }
                    value={value}
                    onChange={(e) => setSubtaskAt(index, e.target.value)}
                    className="h-10 flex-1 rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    disabled={subtasks.length <= 1}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)] disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Remove subtask"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubtask}
                className="w-full rounded-[20px] bg-[#635FC7]/10 py-2.5 text-[13px] font-bold leading-[1.77] text-[#635FC7] transition-colors hover:bg-[#635FC7]/20"
              >
                + Add New Subtask
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((o) => !o)}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]",
                  !selectedColumn && "opacity-70"
                )}
              >
                <span>{selectedColumn?.name ?? "Select column"}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>
              {statusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setStatusOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] py-1 shadow-lg">
                    {columns.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setStatusId(col.id);
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

          {error && (
            <p className="text-[13px] font-medium text-[#EA5555]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "h-10 w-full rounded-[20px] bg-[#635FC7] text-[13px] font-bold leading-[1.77] text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-50"
            )}
          >
            {isSubmitting ? "Creating…" : "Create Task"}
          </button>
        </form>
      </div>
    </>
  );
}
