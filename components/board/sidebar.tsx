"use client";

import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useBoardUIStore } from "@/lib/board-ui-store";
import type { BoardSummary } from "@/lib/board-ui-store";
import { cn } from "@/lib/utils";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { EyeOff, GripVertical, LayoutDashboard, LogOut, Moon, Plus, Sun, User } from "lucide-react";
import { useCallback, useState } from "react";

const SIDEBAR_WIDTH = 300;
const SIDEBAR_COLLAPSED_WIDTH = 72;

function DraggableBoardRow({
  board,
  isSelected,
  onSelect,
  canReorder,
}: {
  board: BoardSummary;
  isSelected: boolean;
  onSelect: () => void;
  canReorder: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: board.id });
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: board.id,
    data: { type: "board" },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-1 rounded-r-[100px] transition-colors",
        isOver && "ring-1 ring-[var(--color-xanban-primary)] ring-inset",
        isDragging && "opacity-60"
      )}
    >
      {canReorder && (
        <span
          ref={setDragRef}
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing rounded p-1 text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
          aria-label="Drag to reorder board"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex flex-1 min-w-0 items-center gap-3 rounded-r-[100px] py-3.5 pr-6 text-left text-[15px] font-bold leading-[1.26] transition-colors",
          canReorder ? "pl-2" : "pl-8",
          isSelected
            ? "bg-[var(--color-xanban-primary)] text-white"
            : "text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
        )}
      >
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        <span className="truncate">{board.name}</span>
      </button>
    </div>
  );
}

export function Sidebar({
  boards = [],
  selectedBoardId = null,
  onSelectBoard,
  onReorderBoards,
  className,
}: {
  boards?: BoardSummary[];
  selectedBoardId?: string | null;
  onSelectBoard?: (id: string) => void;
  onReorderBoards?: (orderedIds: string[]) => void;
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen, setAddBoardModalOpen } = useBoardUIStore();
  const boardCount = boards.length;
  const { user, signOut } = useAuth();
  const [userExpanded, setUserExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleBoardDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over?.id || !onReorderBoards || boards.length < 2) return;
      const draggedId = active.id as string;
      const overId = over.id as string;
      if (!boards.some((b) => b.id === draggedId) || !boards.some((b) => b.id === overId) || draggedId === overId)
        return;
      const fromIndex = boards.findIndex((b) => b.id === draggedId);
      const toIndex = boards.findIndex((b) => b.id === overId);
      if (fromIndex === -1 || toIndex === -1) return;
      const newOrder = [...boards];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      onReorderBoards(newOrder.map((b) => b.id));
    },
    [boards, onReorderBoards]
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[var(--board-line)] bg-[var(--board-sidebar-bg)] transition-[transform] duration-200 md:transition-[width]",
          sidebarOpen ? "w-[300px] translate-x-0" : "w-[300px] -translate-x-full md:w-[72px] md:translate-x-0 md:overflow-hidden",
          className
        )}
      >
        <div
          className={cn(
            "flex h-full shrink-0 flex-col transition-[width] duration-200",
            sidebarOpen ? "w-[300px]" : "w-[72px]"
          )}
        >
          {/* Logo + app name — always visible (persists when sidebar collapsed) */}
          <div
            className={cn(
              "flex items-center pt-8 transition-[padding] duration-200",
              sidebarOpen ? "gap-3 px-8" : "flex-col gap-2 items-center justify-center px-0"
            )}
          >
            <Image
              src="/icon.svg"
              alt=""
              width={24}
              height={25}
              className="shrink-0"
            />
            <span
              className={cn(
                "font-bold leading-[1.26] text-[var(--board-text)]",
                sidebarOpen ? "text-[24px]" : "text-[14px]"
              )}
            >
              Xanban
            </span>
          </div>

          {/* Boards section: list of boards then Create New Board at the end */}
          {sidebarOpen ? (
            <>
              <p className="mt-12 px-8 text-[12px] font-bold uppercase leading-[1.26] tracking-[0.2em] text-[var(--board-text-muted)]">
                All boards ({boardCount})
              </p>
              <DndContext sensors={sensors} onDragEnd={handleBoardDragEnd}>
                <div className="mt-4 flex flex-col gap-1 pr-8">
                  {boards.map((board) => (
                    <DraggableBoardRow
                      key={board.id}
                      board={board}
                      isSelected={board.id === selectedBoardId}
                      onSelect={() => onSelectBoard?.(board.id)}
                      canReorder={!!onReorderBoards && boards.length > 1}
                    />
                  ))}
                </div>
              </DndContext>
              <div className="mt-1 flex flex-col gap-1 pr-8">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-r-[100px] py-3.5 pl-8 pr-6 text-left text-[15px] font-bold leading-[1.26] text-[var(--color-xanban-primary)] transition-colors hover:bg-[var(--color-xanban-primary)]/10"
                  onClick={() => setAddBoardModalOpen(true)}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  + Create New Board
                </button>
              </div>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--board-text-muted)] transition-colors hover:bg-[var(--board-bg)]"
                title={`Boards (${boardCount})`}
                aria-label={`${boardCount} boards`}
              >
                <LayoutDashboard className="h-5 w-5 shrink-0" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-xanban-primary)] transition-colors hover:bg-[var(--color-xanban-primary)]/10"
                title="Create new board"
                aria-label="Create new board"
                onClick={() => setAddBoardModalOpen(true)}
              >
                <Plus className="h-5 w-5 shrink-0" />
              </button>
            </div>
          )}

          {/* Spacer */}
          <div className="min-h-[1rem] flex-1" />

          {/* User block: collapsible; collapsed = icon + display name; expanded = header + email + sign out above */}
          {user && (
            <div
              className={cn(
                "flex flex-col",
                sidebarOpen ? "mx-6 mb-3" : "mb-3 items-center"
              )}
            >
              {/* Expanded content: appears above the header, grows upward */}
              {userExpanded && (
                <div
                  className={cn(
                    "z-50 mb-1 rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] shadow-sm",
                    sidebarOpen ? "w-full p-3" : "p-1.5"
                  )}
                  role="menu"
                >
                  {sidebarOpen ? (
                    <>
                      <p className="truncate px-1 py-1 text-[12px] font-medium text-[var(--board-text-muted)]">
                        {user.email}
                      </p>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-[13px] font-medium text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                      role="menuitem"
                      title="Sign out"
                      aria-label="Sign out"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                    </button>
                  )}
                </div>
              )}

              {/* Persistent header: icon + display name; click toggles expansion */}
              <button
                type="button"
                onClick={() => setUserExpanded((v) => !v)}
                className={cn(
                  "flex items-center gap-3 rounded-lg text-[var(--board-text-muted)] transition-colors hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]",
                  sidebarOpen
                    ? "w-full px-3 py-2.5 text-left"
                    : "h-10 w-10 justify-center"
                )}
                aria-expanded={userExpanded}
                aria-label={userExpanded ? "Collapse account" : "Expand account"}
              >
                <User className="h-5 w-5 shrink-0" />
                {sidebarOpen && (
                  <span className="truncate text-[13px] font-medium">
                    {user.user_metadata?.display_name ||
                      user.email?.split("@")[0] ||
                      "Account"}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Theme toggle: full when open, compact when collapsed */}
          {sidebarOpen ? (
            <div className="mx-6 mb-4 flex items-center justify-center gap-4 rounded-lg bg-[var(--board-bg)] py-3">
              <Sun className="h-5 w-5 shrink-0 text-[var(--board-text-muted)]" />
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                aria-label="Toggle dark mode"
                className={cn(
                  "relative h-5 w-12 shrink-0 rounded-full transition-colors",
                  "bg-[var(--color-xanban-primary)]"
                )}
                onClick={toggleTheme}
              >
                <span
                  className={cn(
                    "absolute top-1 h-3 w-3 rounded-full bg-white transition-[left] duration-200",
                    theme === "dark" ? "left-8" : "left-1"
                  )}
                />
              </button>
              <Moon className="h-5 w-5 shrink-0 text-[var(--board-text-muted)]" />
            </div>
          ) : (
            /* Vertically centered with the floating Show sidebar pill (bottom-8 + half pill height) */
            <div className="mb-[50px] flex justify-center">
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                aria-label="Toggle dark mode"
                className={cn(
                  "relative h-4 w-8 shrink-0 rounded-full transition-colors",
                  "bg-[var(--color-xanban-primary)]"
                )}
                onClick={toggleTheme}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-[left] duration-200",
                    theme === "dark" ? "left-4" : "left-1"
                  )}
                />
              </button>
            </div>
          )}

          {/* Hide Sidebar (only when expanded; collapsed state uses floating pill to expand) */}
          {sidebarOpen && (
            <div className="mb-8 mr-6">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex w-full items-center gap-3 rounded-r-[100px] py-3.5 pl-8 pr-6 text-[15px] font-bold leading-[1.26] text-[var(--board-text-muted)] transition-colors hover:bg-[var(--board-bg)]"
              >
                <EyeOff className="h-4 w-4 shrink-0" />
                Hide Sidebar
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
export const SIDEBAR_COLLAPSED_WIDTH_PX = SIDEBAR_COLLAPSED_WIDTH;
