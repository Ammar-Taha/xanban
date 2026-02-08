"use client";

import type { BoardSummary } from "@/lib/board-ui-store";
import { useBoardUIStore } from "@/lib/board-ui-store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { AddNewBoardModal } from "./add-new-board-modal";
import { AddNewColumnModal } from "./add-new-column-modal";
import { AddNewTaskModal } from "./add-new-task-modal";
import { BoardHeader } from "./board-header";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { DeleteTaskModal } from "./delete-task-modal";
import { EditTaskModal } from "./edit-task-modal";
import { Sidebar } from "./sidebar";
import { ShowSidebarButton } from "./show-sidebar-button";
import { TaskModalsProvider, useTaskModals } from "./task-modals-context";
import { ViewTaskModal } from "./view-task-modal";

function BoardLayoutContent({
  children,
  boards = [],
  selectedBoardId = null,
  selectedBoardName,
  onBoardCreated,
  onSelectBoard,
  onTaskCreated,
  onColumnAdded,
}: {
  children?: React.ReactNode;
  boards?: BoardSummary[];
  selectedBoardId?: string | null;
  selectedBoardName?: string | null;
  onBoardCreated?: (boardId: string) => void;
  onSelectBoard?: (id: string) => void;
  onTaskCreated?: () => void;
  onColumnAdded?: () => void;
}) {
  const {
    sidebarOpen,
    addBoardModalOpen,
    setAddBoardModalOpen,
    addTaskModalOpen,
    setAddTaskModalOpen,
    addColumnModalOpen,
    setAddColumnModalOpen,
  } = useBoardUIStore();
  const {
    viewCardId,
    setViewCardId,
    editCardId,
    setEditCardId,
    deleteTask,
    setDeleteTask,
  } = useTaskModals();
  const [isDeleting, setIsDeleting] = useState(false);

  const hasBoards = boards.length > 0;

  const mainContent = !hasBoards ? (
    <DashboardEmptyState onCreateBoard={() => setAddBoardModalOpen(true)} />
  ) : (
    children ?? null
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTask) return;
    setIsDeleting(true);
    const supabase = createClient();
    await supabase.from("cards").delete().eq("id", deleteTask.cardId);
    setDeleteTask(null);
    setIsDeleting(false);
    onTaskCreated?.();
  }, [deleteTask, setDeleteTask, onTaskCreated]);

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

      <AddNewTaskModal
        open={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        boardId={selectedBoardId}
        onTaskCreated={onTaskCreated}
      />

      <AddNewColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        boardId={selectedBoardId}
        onColumnAdded={onColumnAdded}
      />

      <ViewTaskModal
        open={!!viewCardId}
        onClose={() => setViewCardId(null)}
        cardId={viewCardId}
        boardId={selectedBoardId}
        onEdit={(id) => {
          setViewCardId(null);
          setEditCardId(id);
        }}
        onDelete={(id, title) => {
          setViewCardId(null);
          setDeleteTask({ cardId: id, title });
        }}
        onTaskChanged={onTaskCreated}
      />

      <EditTaskModal
        open={!!editCardId}
        onClose={() => setEditCardId(null)}
        cardId={editCardId}
        boardId={selectedBoardId}
        onSaved={() => {
          setEditCardId(null);
          onTaskCreated?.();
        }}
      />

      <DeleteTaskModal
        open={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        taskTitle={deleteTask?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Main: header + content — starts after sidebar on desktop */}
      <main
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-200",
          sidebarOpen ? "md:ml-[300px]" : "md:ml-[72px]"
        )}
      >
        <BoardHeader
          boardName={selectedBoardName}
          onAddTask={() => setAddTaskModalOpen(true)}
          disableAddTask={!selectedBoardId}
        />
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

export function BoardLayout(props: Parameters<typeof BoardLayoutContent>[0]) {
  return (
    <TaskModalsProvider>
      <BoardLayoutContent {...props} />
    </TaskModalsProvider>
  );
}
