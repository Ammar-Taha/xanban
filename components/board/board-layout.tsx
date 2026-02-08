"use client";

import type { BoardSummary } from "@/lib/board-ui-store";
import { useBoardUIStore } from "@/lib/board-ui-store";
import { SHORTCUTS } from "@/lib/shortcuts";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddNewBoardModal } from "./add-new-board-modal";
import { AddNewColumnModal } from "./add-new-column-modal";
import { AddNewTaskModal } from "./add-new-task-modal";
import { BoardHeader } from "./board-header";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { DeleteBoardModal } from "./delete-board-modal";
import { DeleteTaskModal } from "./delete-task-modal";
import { EditBoardModal } from "./edit-board-modal";
import { EditTaskModal } from "./edit-task-modal";
import { CommandPalette } from "./command-palette";
import { ManageLabelsModal } from "./manage-labels-modal";
import { SearchTasksModal } from "./search-tasks-modal";
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
  onBoardDeleted,
  onBoardUpdated,
  onReorderBoards,
  onSelectBoard,
  onTaskCreated,
  onColumnAdded,
}: {
  children?: React.ReactNode;
  boards?: BoardSummary[];
  selectedBoardId?: string | null;
  selectedBoardName?: string | null;
  onBoardCreated?: (boardId: string) => void;
  onBoardDeleted?: () => void;
  onBoardUpdated?: () => void;
  onReorderBoards?: (orderedIds: string[]) => void;
  onSelectBoard?: (id: string) => void;
  onTaskCreated?: () => void;
  onColumnAdded?: () => void;
}) {
  const {
    sidebarOpen,
    setSidebarOpen,
    addBoardModalOpen,
    setAddBoardModalOpen,
    addTaskModalOpen,
    setAddTaskModalOpen,
    addColumnModalOpen,
    setAddColumnModalOpen,
    editBoardModalOpen,
    setEditBoardModalOpen,
    deleteBoardModalOpen,
    setDeleteBoardModalOpen,
    manageLabelsModalOpen,
    setManageLabelsModalOpen,
    searchOpen,
    setSearchOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
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
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);
  const [boardMenuOpenTrigger, setBoardMenuOpenTrigger] = useState(0);

  const hasBoards = boards.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const el = document.activeElement;
      const isInput = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el as HTMLElement).isContentEditable);
      const modalsOpen = addTaskModalOpen || searchOpen || editBoardModalOpen || deleteBoardModalOpen || manageLabelsModalOpen || addBoardModalOpen || viewCardId || editCardId || deleteTask;

      if (mod && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }
      if (isInput || commandPaletteOpen) return;

      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (modalsOpen) return;
        e.preventDefault();
        setAddTaskModalOpen(true);
        return;
      }

      if (modalsOpen) return;

      if (mod && e.key === "b" && !e.shiftKey) {
        e.preventDefault();
        if (selectedBoardId) setBoardMenuOpenTrigger((t) => t + 1);
        return;
      }
      if (mod && e.shiftKey && e.key === "B") {
        e.preventDefault();
        setAddBoardModalOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key === "C") {
        e.preventDefault();
        if (selectedBoardId) setAddColumnModalOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key === "L") {
        e.preventDefault();
        setManageLabelsModalOpen(true);
        return;
      }
      if (mod && e.key === "\\") {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, addTaskModalOpen, searchOpen, editBoardModalOpen, deleteBoardModalOpen, manageLabelsModalOpen, addBoardModalOpen, viewCardId, editCardId, deleteTask, selectedBoardId, sidebarOpen, setAddTaskModalOpen, setCommandPaletteOpen, setAddBoardModalOpen, setAddColumnModalOpen, setManageLabelsModalOpen, setSidebarOpen]);

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

  const handleDeleteBoardConfirm = useCallback(async () => {
    if (!selectedBoardId) return;
    setIsDeletingBoard(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase infers never
    await (supabase.from("boards") as any).delete().eq("id", selectedBoardId);
    setDeleteBoardModalOpen(false);
    setIsDeletingBoard(false);
    onBoardDeleted?.();
  }, [selectedBoardId, setDeleteBoardModalOpen, onBoardDeleted]);

  const commandPaletteCommands = useMemo(
    () => [
      {
        id: "add-task",
        label: "Add new task",
        shortcut: SHORTCUTS.addTask,
        onSelect: () => setAddTaskModalOpen(true),
      },
      {
        id: "search",
        label: "Search tasks",
        shortcut: SHORTCUTS.search,
        onSelect: () => setSearchOpen(true),
      },
      ...(selectedBoardId
        ? [
            { id: "board-options", label: "Board options", shortcut: SHORTCUTS.boardOptions, onSelect: () => setBoardMenuOpenTrigger((t) => t + 1) },
            { id: "add-column", label: "Add new column", shortcut: SHORTCUTS.addColumn, onSelect: () => setAddColumnModalOpen(true) },
          ]
        : []),
      { id: "manage-labels", label: "Manage labels", shortcut: SHORTCUTS.manageLabels, onSelect: () => setManageLabelsModalOpen(true) },
      {
        id: "toggle-sidebar",
        label: sidebarOpen ? "Hide sidebar" : "Show sidebar",
        shortcut: SHORTCUTS.toggleSidebar,
        onSelect: () => setSidebarOpen(!sidebarOpen),
      },
      {
        id: "new-board",
        label: "Create new board",
        shortcut: SHORTCUTS.createBoard,
        onSelect: () => setAddBoardModalOpen(true),
      },
    ],
    [
      selectedBoardId,
      sidebarOpen,
      setAddTaskModalOpen,
      setSearchOpen,
      setAddBoardModalOpen,
      setAddColumnModalOpen,
      setManageLabelsModalOpen,
      setSidebarOpen,
    ]
  );

  return (
    <div className="flex min-h-screen bg-[var(--board-bg)]">
      <Sidebar
        boards={boards}
        selectedBoardId={selectedBoardId}
        onSelectBoard={onSelectBoard}
        onReorderBoards={onReorderBoards}
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
        onArchive={async (id) => {
          setViewCardId(null);
          const supabase = createClient();
          await (supabase.from("cards") as any).update({ is_archived: true }).eq("id", id);
          onTaskCreated?.();
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

      <EditBoardModal
        open={editBoardModalOpen}
        onClose={() => setEditBoardModalOpen(false)}
        boardId={selectedBoardId ?? null}
        onSaved={() => {
          setEditBoardModalOpen(false);
          onBoardUpdated?.();
          onTaskCreated?.();
        }}
      />

      <DeleteBoardModal
        open={deleteBoardModalOpen}
        onClose={() => setDeleteBoardModalOpen(false)}
        boardName={selectedBoardName ?? "this board"}
        onConfirm={handleDeleteBoardConfirm}
        isDeleting={isDeletingBoard}
      />

      <ManageLabelsModal
        open={manageLabelsModalOpen}
        onClose={() => setManageLabelsModalOpen(false)}
      />

      <SearchTasksModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        boards={boards}
        selectedBoardId={selectedBoardId}
        onSelectBoard={(id) => onSelectBoard?.(id)}
        onOpenTask={setViewCardId}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commandPaletteCommands}
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
          onEditBoard={() => setEditBoardModalOpen(true)}
          onDeleteBoard={() => setDeleteBoardModalOpen(true)}
          onManageLabels={() => setManageLabelsModalOpen(true)}
          disableAddTask={!selectedBoardId}
          showBoardMenu={!!selectedBoardId}
          openBoardMenuTrigger={boardMenuOpenTrigger}
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
