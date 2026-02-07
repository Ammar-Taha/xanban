"use client";

import { useBoardUIStore } from "@/lib/board-ui-store";
import { cn } from "@/lib/utils";
import { AddNewBoardModal } from "./add-new-board-modal";
import { BoardEmptyState } from "./board-empty-state";
import { BoardHeader } from "./board-header";
import { Sidebar } from "./sidebar";
import { ShowSidebarButton } from "./show-sidebar-button";

export function BoardLayout({
  children,
  boardName,
  boardCount = 0,
  onBoardCreated,
}: {
  children?: React.ReactNode;
  boardName?: string;
  boardCount?: number;
  onBoardCreated?: (boardId: string) => void;
}) {
  const { sidebarOpen, addBoardModalOpen, setAddBoardModalOpen } =
    useBoardUIStore();

  return (
    <div className="flex min-h-screen bg-[var(--board-bg)]">
      <Sidebar boardCount={boardCount} />
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
          sidebarOpen ? "md:ml-[300px]" : "md:ml-[72px]"
        )}
      >
        <BoardHeader boardName={boardName} />
        {children != null ? (
          children
        ) : (
          <BoardEmptyState onAddColumn={() => {}} />
        )}
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
