"use client";

import { ColumnColorPicker } from "@/components/board/column-color-picker";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_COLUMN_COLOR = "#635FC7";

type ColumnRow = { id: string | null; name: string; color: string };

type EditBoardModalProps = {
  open: boolean;
  onClose: () => void;
  boardId: string | null;
  onSaved?: () => void;
};

export function EditBoardModal({
  open,
  onClose,
  boardId,
  onSaved,
}: EditBoardModalProps) {
  const [boardName, setBoardName] = useState("");
  const [columns, setColumns] = useState<ColumnRow[]>([{ id: null, name: "", color: DEFAULT_COLUMN_COLOR }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    if (!boardId || !open) return;
    setLoading(true);
    const supabase = createClient();
    const { data: board } = (await supabase
      .from("boards")
      .select("id, name")
      .eq("id", boardId)
      .single()) as { data: { name: string } | null };
    if (!board) {
      setLoading(false);
      return;
    }
    setBoardName(board.name);
    const { data: cols } = (await supabase
      .from("columns")
      .select("id, name, position, color")
      .eq("board_id", boardId)
      .order("position", { ascending: true })) as {
      data: { id: string; name: string; position: number; color: string | null }[] | null;
    };
    setColumns(
      (cols ?? []).length > 0
        ? (cols ?? []).map((c) => ({ id: c.id, name: c.name, color: c.color && /^#[0-9A-Fa-f]{6}$/.test(c.color) ? c.color : DEFAULT_COLUMN_COLOR }))
        : [{ id: null, name: "", color: DEFAULT_COLUMN_COLOR }]
    );
    setLoading(false);
  }, [boardId, open]);

  useEffect(() => {
    if (open && boardId) fetchBoard();
  }, [open, boardId, fetchBoard]);

  const addColumn = useCallback(() => {
    setColumns((prev) => [...prev, { id: null, name: "", color: DEFAULT_COLUMN_COLOR }]);
  }, []);

  const removeColumn = useCallback((index: number) => {
    setColumns((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const setColumnAt = useCallback((index: number, name: string) => {
    setColumns((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name };
      return next;
    });
  }, []);

  const setColumnColorAt = useCallback((index: number, color: string) => {
    setColumns((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], color };
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const name = boardName.trim();
      if (!name) {
        setError("Board name is required.");
        return;
      }
      if (!boardId) return;
      const columnNames = columns.map((c) => c.name.trim()).filter(Boolean);
      if (columnNames.length === 0) {
        setError("Add at least one column.");
        return;
      }

      setIsSubmitting(true);
      const supabase = createClient();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers never
        const { error: boardErr } = (await (supabase.from("boards") as any)
          .update({ name })
          .eq("id", boardId)) as { error: { message: string } | null };
        if (boardErr) {
          setError(boardErr.message || "Failed to update board.");
          return;
        }

        const keptIds = new Set(
          columns.filter((c) => c.id != null).map((c) => c.id as string)
        );
        const { data: existingCols } = (await supabase
          .from("columns")
          .select("id")
          .eq("board_id", boardId)) as { data: { id: string }[] | null };
        for (const col of existingCols ?? []) {
          if (!keptIds.has(col.id)) {
            await supabase.from("columns").delete().eq("id", col.id);
          }
        }

        await Promise.all(
          columns.map(async (row, index) => {
            const trimmedName = row.name.trim();
            if (!trimmedName) return;
            if (row.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase infers never
              await (supabase.from("columns") as any)
                .update({ name: trimmedName, position: index, color: row.color || null })
                .eq("id", row.id);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase infers never
              await (supabase.from("columns") as any).insert({
                board_id: boardId,
                name: trimmedName,
                position: index,
                color: row.color || null,
              });
            }
          })
        );

        handleClose();
        onSaved?.();
      } finally {
        setIsSubmitting(false);
      }
    },
    [boardName, columns, boardId, handleClose, onSaved]
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" aria-hidden onClick={handleClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="edit-board-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="edit-board-title"
            className="text-[18px] font-bold leading-[1.26] text-[var(--board-text)]"
          >
            Edit Board
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
              <label
                htmlFor="edit-board-name"
                className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]"
              >
                Board Name
              </label>
              <input
                id="edit-board-name"
                type="text"
                placeholder="e.g. Platform Launch"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="h-10 w-full rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
                Board Columns
              </label>
              <div className="space-y-3">
                {columns.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ColumnColorPicker
                      value={row.color}
                      onChange={(color) => setColumnColorAt(index, color)}
                      showHex={false}
                      className="shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Todo"
                      value={row.name}
                      onChange={(e) => setColumnAt(index, e.target.value)}
                      className="h-10 flex-1 min-w-0 rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text)] placeholder:opacity-25 focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
                    />
                    <button
                      type="button"
                      onClick={() => removeColumn(index)}
                      disabled={columns.length <= 1}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)] disabled:opacity-40"
                      aria-label="Remove column"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColumn}
                  className="w-full rounded-[20px] bg-[#635FC7]/10 py-2.5 text-[13px] font-bold leading-[1.77] text-[#635FC7] hover:bg-[#635FC7]/20"
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
