"use client";

import { useBoardUIStore } from "@/lib/board-ui-store";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutDashboard, MoreVertical, Plus, Search } from "lucide-react";
import { useState } from "react";

const PLACEHOLDER_BOARD_NAME = "Untitled board";

export function BoardHeader({
  boardName,
  onAddTask,
  onEditBoard,
  onDeleteBoard,
  onManageLabels,
  onOpenSettings,
  disableAddTask,
  showBoardMenu = true,
}: {
  boardName?: string | null;
  onAddTask?: () => void;
  onEditBoard?: () => void;
  onDeleteBoard?: () => void;
  onManageLabels?: () => void;
  onOpenSettings?: () => void;
  disableAddTask?: boolean;
  /** When false (e.g. no board selected after delete), the three-dots Edit/Delete menu is hidden. */
  showBoardMenu?: boolean;
}) {
  const { sidebarOpen, setSidebarOpen, setSearchOpen } = useBoardUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = boardName?.trim() || PLACEHOLDER_BOARD_NAME;
  const isPlaceholder = !boardName?.trim();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 md:h-[97px] md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {/* Mobile: show sidebar toggle when sidebar is closed */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] text-[var(--board-text)] md:hidden",
            sidebarOpen && "hidden"
          )}
          aria-label="Open menu"
        >
          <LayoutDashboard className="h-5 w-5" />
        </button>
        {/* Board name with chevron (dropdown for board switch on mobile) */}
        <div className="flex min-w-0 items-center gap-2">
          <h1
            className={cn(
              "truncate text-[18px] font-bold leading-[1.26] md:text-[24px]",
              isPlaceholder ? "text-[var(--board-text-muted)]" : "text-[var(--board-text)]"
            )}
            title={isPlaceholder ? "Create or select a board to name it" : undefined}
          >
            {displayName}
          </h1>
          <button
            type="button"
            className="flex shrink-0 items-center text-[var(--board-text-muted)] md:hidden"
            aria-label="Select board"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
          aria-label="Search tasks"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onAddTask}
          disabled={disableAddTask}
          className="flex items-center gap-2 rounded-full bg-[var(--color-xanban-primary)] px-4 py-3 text-[15px] font-bold leading-[1.26] text-white transition-colors hover:bg-[var(--color-xanban-primary-hover)] disabled:opacity-25"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add New Task</span>
        </button>
        {showBoardMenu && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
              aria-label="Board options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] py-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEditBoard?.();
                    }}
                    className="w-full px-4 py-2 text-left text-[13px] font-medium text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                  >
                    Edit Board
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onManageLabels?.();
                    }}
                    className="w-full px-4 py-2 text-left text-[13px] font-medium text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                  >
                    Manage labels
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteBoard?.();
                    }}
                    className="w-full px-4 py-2 text-left text-[13px] font-medium text-[#EA5555] hover:bg-[#EA5555]/10"
                  >
                    Delete Board
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
