"use client";

import type { BoardSummary } from "@/lib/board-ui-store";
import { useBoardUIStore } from "@/lib/board-ui-store";
import { cn } from "@/lib/utils";
import { AddNewBoardModal } from "./add-new-board-modal";
import { BoardHeader } from "./board-header";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { Sidebar } from "./sidebar";
import { ShowSidebarButton } from "./show-sidebar-button";

export function BoardLayout({
  children,
  boards = [],
  selectedBoardId = null,
  selectedBoardName,
  onBoardCreated,
  onSelectBoard,
}: {
  children?: React.ReactNode;
  boards?: BoardSummary[];
  selectedBoardId?: string | null;
  selectedBoardName?: string | null;
  onBoardCreated?: (boardId: string) => void;
  onSelectBoard?: (id: string) => void;
}) {
  const { sidebarOpen, addBoardModalOpen, setAddBoardModalOpen } =
    useBoardUIStore();

  const hasBoards = boards.length > 0;

  const mainContent = !hasBoards ? (
    <DashboardEmptyState onCreateBoard={() => setAddBoardModalOpen(true)} />
  ) : (
    children ?? null
  );

  return (
    <div className="flex min-h-screen bg-[var(--board-bg)]">
      <Sidebar
        boards={boards}
        selectedBoardId={selectedBoardId}
        onSelectBoard={onSelectBoard}
      />
      <ShowSidebarButton />

      <AddNewBoardModal
        open={addBoardModalOpen}
        onClose={() => setAddBoardModalOpen(false)}
        onBoardCreated={onBoardCreated}
      />

      {/* Main: header + content — starts after sidebar on desktop */}
      <main
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-200",
          sidebarOpen ? "md:ml-[300px]" : "md:ml-[112px]"
        )}
      >
        <BoardHeader boardName={selectedBoardName} />
        {mainContent}
      </main>

      {/* Mobile sidebar overlay when open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-hidden
          onClick={() => useBoardUIStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
