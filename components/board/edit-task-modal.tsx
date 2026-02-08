"use client";

import { LabelPicker } from "@/components/board/label-picker";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ColumnOption = { id: string; name: string; position: number };

type EditTaskModalProps = {
  open: boolean;
  onClose: () => void;
  cardId: string | null;
  boardId: string | null;
  onSaved?: () => void;
};

export function EditTaskModal({
  open,
  onClose,
  cardId,
  boardId,
  onSaved,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState<{ id: string | null; title: string }[]>([{ id: null, title: "" }]);
  const [statusId, setStatusId] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialColumnId, setInitialColumnId] = useState<string>("");

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

  const fetchTask = useCallback(async () => {
    if (!cardId || !open) return;
    setLoading(true);
    const supabase = createClient();
    const { data: card } = (await supabase
      .from("cards")
      .select("id, title, description, column_id")
      .eq("id", cardId)
      .single()) as { data: { title: string; description: string | null; column_id: string } | null };
    if (!card) {
      setLoading(false);
      return;
    }
    setTitle(card.title);
    setDescription(card.description ?? "");
    setStatusId(card.column_id);
    setInitialColumnId(card.column_id);
    const { data: subs } = (await supabase
      .from("subtasks")
      .select("id, title")
      .eq("card_id", cardId)
      .order("position", { ascending: true })) as { data: { id: string; title: string }[] | null };
    setSubtasks(
      (subs ?? []).length > 0
        ? (subs ?? []).map((s) => ({ id: s.id, title: s.title }))
        : [{ id: null, title: "" }]
    );
    const { data: labelRows } = (await supabase
      .from("card_labels")
      .select("label_id")
      .eq("card_id", cardId)) as { data: { label_id: string }[] | null };
    setSelectedLabelIds((labelRows ?? []).map((r) => r.label_id));
    setLoading(false);
  }, [cardId, open]);

  useEffect(() => {
    if (open && boardId) fetchColumns();
  }, [open, boardId, fetchColumns]);
  useEffect(() => {
    if (open && cardId) fetchTask();
  }, [open, cardId, fetchTask]);

  const addSubtask = useCallback(() => {
    setSubtasks((prev) => [...prev, { id: null, title: "" }]);
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
      next[index] = { ...next[index], title: value };
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    setError(null);
    setStatusOpen(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("Title is required.");
        return;
      }
      if (!statusId || !cardId) return;

      setIsSubmitting(true);
      const supabase = createClient();
      try {
        const movingColumn = statusId !== initialColumnId;
        let nextPosition: number | undefined;
        if (movingColumn) {
          const { data: maxPos } = (await supabase
            .from("cards")
            .select("position")
            .eq("column_id", statusId)
            .order("position", { ascending: false })
            .limit(1)
            .maybeSingle()) as { data: { position: number } | null };
          nextPosition = maxPos?.position != null ? maxPos.position + 1 : 0;
        }
        const updatePayload: Record<string, unknown> = {
          title: trimmedTitle,
          description: description.trim() || "",
          column_id: statusId,
        };
        if (nextPosition !== undefined) updatePayload.position = nextPosition;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never
        const { error: cardError } = (await (supabase.from("cards") as any)
          .update(updatePayload)
          .eq("id", cardId)) as { error: { message: string } | null };
        if (cardError) {
          setError(cardError.message || "Failed to update task.");
          return;
        }
        await supabase.from("subtasks").delete().eq("card_id", cardId);
        const subtaskTitles = subtasks.map((s) => s.title.trim()).filter(Boolean);
        if (subtaskTitles.length > 0) {
          const rows = subtaskTitles.map((title, position) => ({
            card_id: cardId,
            title,
            position,
          }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never
          await supabase.from("subtasks").insert(rows as any);
        }
        await supabase.from("card_labels").delete().eq("card_id", cardId);
        if (selectedLabelIds.length > 0) {
          const labelRows = selectedLabelIds.map((label_id) => ({ card_id: cardId, label_id }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types incomplete
          await supabase.from("card_labels").insert(labelRows as any);
        }
        handleClose();
        onSaved?.();
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, description, subtasks, statusId, selectedLabelIds, initialColumnId, cardId, handleClose, onSaved]
  );

  if (!open) return null;

  const selectedColumn = columns.find((c) => c.id === statusId);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" aria-hidden onClick={handleClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="edit-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="edit-task-title" className="text-[18px] font-bold leading-[1.26] text-[var(--board-text)]">
            Edit Task
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-xanban-primary)] border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            <div className="space-y-2">
              <label htmlFor="edit-task-title-input" className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
                Title
              </label>
              <input
                id="edit-task-title-input"
                type="text"
                placeholder="e.g. Take coffee break."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-task-desc" className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
                Description
              </label>
              <textarea
                id="edit-task-desc"
                rows={3}
                placeholder="e.g. It's always good to take a break."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 py-3 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">Subtasks</label>
              <div className="space-y-3">
                {subtasks.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={index === 0 ? "e.g. Make coffee." : "e.g. Drink coffee & smile."}
                      value={item.title}
                      onChange={(e) => setSubtaskAt(index, e.target.value)}
                      className="h-10 flex-1 rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      disabled={subtasks.length <= 1}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)] disabled:opacity-40"
                      aria-label="Remove subtask"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubtask}
                  className="w-full rounded-[20px] bg-[#635FC7]/10 py-2.5 text-[13px] font-bold leading-[1.77] text-[#635FC7] hover:bg-[#635FC7]/20"
                >
                  + Add New Subtask
                </button>
              </div>
            </div>
            <LabelPicker
              selectedIds={selectedLabelIds}
              onChange={setSelectedLabelIds}
            />
            <div className="space-y-2">
              <label className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">Status</label>
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
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setStatusOpen(false)} />
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
            {error && <p className="text-[13px] font-medium text-[#EA5555]">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-[20px] bg-[#635FC7] text-[13px] font-bold leading-[1.77] text-white hover:bg-[#A8A4FF] disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
