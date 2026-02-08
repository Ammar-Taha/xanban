"use client";

type DeleteBoardModalProps = {
  open: boolean;
  onClose: () => void;
  boardName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteBoardModal({
  open,
  onClose,
  boardName,
  onConfirm,
  isDeleting = false,
}: DeleteBoardModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" aria-hidden onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="delete-board-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="delete-board-title"
          className="text-[18px] font-bold leading-[1.26] text-[#EA5555]"
        >
          Delete this board?
        </h2>
        <p className="mt-4 text-[13px] font-medium leading-[1.77] text-[var(--board-text-muted)]">
          Are you sure you want to delete the &apos;{boardName}&apos; board? This
          action will remove all columns and tasks and cannot be reversed.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-[20px] bg-[#EA5555] py-3 text-[13px] font-bold leading-[1.77] text-white hover:bg-[#EA5555]/90 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[20px] bg-[#635FC7]/10 py-3 text-[13px] font-bold leading-[1.77] text-[#635FC7] hover:bg-[#635FC7]/20"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
