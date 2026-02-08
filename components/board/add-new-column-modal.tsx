"use client";

import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

type AddNewColumnModalProps = {
  open: boolean;
  onClose: () => void;
  boardId: string | null;
  onColumnAdded?: () => void;
};

export function AddNewColumnModal({
  open,
  onClose,
  boardId,
  onColumnAdded,
}: AddNewColumnModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName("");
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = name.trim();
      if (!trimmed) {
        setError("Column name is required.");
        return;
      }
      if (!boardId) {
        setError("No board selected.");
        return;
      }

      setIsSubmitting(true);
      const supabase = createClient();
      try {
        const { data: maxPos } = (await supabase
          .from("columns")
          .select("position")
          .eq("board_id", boardId)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle()) as { data: { position: number } | null };
        const nextPosition = maxPos?.position != null ? maxPos.position + 1 : 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never
        const { error: insertError } = (await (supabase.from("columns") as any).insert({
          board_id: boardId,
          name: trimmed,
          position: nextPosition,
        })) as { error: { message: string } | null };

        if (insertError) {
          setError(insertError.message || "Failed to add column.");
          return;
        }
        reset();
        handleClose();
        onColumnAdded?.();
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, boardId, reset, handleClose, onColumnAdded]
  );

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
        onClick={handleClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-6 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="add-column-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="add-column-title"
            className="text-[18px] font-bold leading-[1.26] text-[var(--board-text)]"
          >
            Add New Column
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="add-column-name"
              className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]"
            >
              Name
            </label>
            <input
              id="add-column-name"
              type="text"
              placeholder="e.g. Todo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[13px] font-medium text-[#EA5555]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-[20px] bg-[#635FC7] text-[13px] font-bold leading-[1.77] text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-50"
          >
            {isSubmitting ? "Adding…" : "Add Column"}
          </button>
        </form>
      </div>
    </>
  );
}
