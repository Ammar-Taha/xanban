"use client";

import { Plus } from "lucide-react";

export function BoardEmptyState({
  onAddColumn,
}: {
  onAddColumn?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <p className="text-center text-[18px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
        This board is empty. Create a new column to get started.
      </p>
      <button
        type="button"
        onClick={onAddColumn}
        className="mt-7 flex items-center gap-2 rounded-full bg-[var(--color-xanban-primary)] px-6 py-3 text-[15px] font-bold leading-[1.26] text-white transition-colors hover:bg-[var(--color-xanban-primary-hover)]"
      >
        <Plus className="h-4 w-4" />
        Add New Column
      </button>
    </div>
  );
}
