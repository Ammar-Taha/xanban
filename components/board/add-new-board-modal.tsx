"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

type AddNewBoardModalProps = {
  open: boolean;
  onClose: () => void;
  onBoardCreated?: (boardId: string) => void;
};

export function AddNewBoardModal({
  open,
  onClose,
  onBoardCreated,
}: AddNewBoardModalProps) {
  const { user } = useAuth();
  const [boardName, setBoardName] = useState("");
  const [columns, setColumns] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addColumn = useCallback(() => {
    setColumns((prev) => [...prev, ""]);
  }, []);

  const removeColumn = useCallback((index: number) => {
    setColumns((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const setColumnName = useCallback((index: number, value: string) => {
    setColumns((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const resetForm = useCallback(() => {
    setBoardName("");
    setColumns([""]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const name = boardName.trim();
      if (!name) {
        setError("Board name is required.");
        return;
      }
      const columnNames = columns.map((c) => c.trim()).filter(Boolean);
      if (columnNames.length === 0) {
        setError("Add at least one column.");
        return;
      }
      if (!user?.id) {
        setError("You must be signed in to create a board.");
        return;
      }

      setIsSubmitting(true);
      const supabase = createClient();

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client generic inference fails with our Database type
        const { data: boardData, error: boardError } = (await supabase
          .from("boards")
          .insert({ user_id: user.id, name } as any)
          .select("id")
          .single()) as {
          data: { id: string } | null;
          error: { message: string } | null;
        };

        if (boardError) {
          setError(boardError.message || "Failed to create board.");
          return;
        }
        const boardId = boardData?.id;
        if (!boardId) {
          setError("Failed to create board.");
          return;
        }

        const columnRows = columnNames.map((colName, position) => ({
          board_id: boardId,
          name: colName,
          position,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client generic inference fails with our Database type
        const { error: colsError } = (await supabase
          .from("columns")
          .insert(columnRows as any)) as { error: { message: string } | null };

        if (colsError) {
          setError(colsError.message || "Failed to create columns.");
          return;
        }

        resetForm();
        onClose();
        onBoardCreated?.(boardId);
      } finally {
        setIsSubmitting(false);
      }
    },
    [boardName, columns, user?.id, onClose, onBoardCreated, resetForm]
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
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="add-new-board-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="add-new-board-title"
            className="text-[18px] font-bold leading-[1.26] text-[var(--board-text)]"
          >
            Add New Board
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
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="add-board-name"
              className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]"
            >
              Name
            </label>
            <input
              id="add-board-name"
              type="text"
              placeholder="e.g. Web Design"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
              autoFocus
            />
          </div>

          {/* Columns */}
          <div className="space-y-2">
            <label className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
              Columns
            </label>
            <div className="space-y-3">
              {columns.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Todo"
                    value={value}
                    onChange={(e) => setColumnName(index, e.target.value)}
                    className="h-10 flex-1 rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
                  />
                  <button
                    type="button"
                    onClick={() => removeColumn(index)}
                    disabled={columns.length <= 1}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)] disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Remove column"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addColumn}
                className="w-full rounded-[20px] bg-[#635FC7]/10 py-2.5 text-[13px] font-bold leading-[1.77] text-[#635FC7] transition-colors hover:bg-[#635FC7]/20"
              >
                + Add New Column
              </button>
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
            {isSubmitting ? "Creating…" : "Create New Board"}
          </button>
        </form>
      </div>
    </>
  );
}
