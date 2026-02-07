"use client";

import Image from "next/image";
import { useTheme } from "@/components/providers/theme-provider";
import { useBoardUIStore } from "@/lib/board-ui-store";
import { EyeOff, LayoutDashboard, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 300;
const SIDEBAR_COLLAPSED_WIDTH = 0;

export function Sidebar({
  boardCount = 0,
  className,
}: {
  boardCount?: number;
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen } = useBoardUIStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[var(--board-line)] bg-[var(--board-sidebar-bg)] transition-[transform] duration-200 md:transition-[width]",
          sidebarOpen ? "w-[300px] translate-x-0" : "w-[300px] -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden",
          className
        )}
      >
        <div className="flex h-full w-[300px] shrink-0 flex-col">
          {/* Logo + app name */}
          <div className="flex items-center gap-3 px-8 pt-8">
            <Image
              src="/icon.svg"
              alt=""
              width={24}
              height={25}
              className="shrink-0"
            />
            <span className="text-[24px] font-bold leading-[1.26] text-[var(--board-text)]">
              Xanban
            </span>
          </div>

          {/* ALL BOARDS (n) */}
          <p className="mt-12 px-8 text-[12px] font-bold uppercase leading-[1.26] tracking-[0.2em] text-[var(--board-text-muted)]">
            All boards ({boardCount})
          </p>

          {/* Board list: only "+ Create New Board" for empty state — button extends to left edge, content aligned with ALL BOARDS */}
          <div className="mt-4 flex flex-col gap-1 pr-8">
            <button
              type="button"
              className="flex items-center gap-3 rounded-r-[100px] py-3.5 pl-8 pr-6 text-left text-[15px] font-bold leading-[1.26] text-[var(--color-xanban-primary)] transition-colors hover:bg-[var(--color-xanban-primary)]/10"
              onClick={() => {}}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              + Create New Board
            </button>
          </div>

          {/* Spacer */}
          <div className="min-h-[1rem] flex-1" />

          {/* Theme toggle */}
          <div className="mx-6 mb-4 flex items-center justify-center gap-4 rounded-lg bg-[var(--board-bg)] py-3">
            <Sun className="h-5 w-5 shrink-0 text-[var(--board-text-muted)]" />
            <button
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Toggle dark mode"
              className={cn(
                "relative h-5 w-12 shrink-0 rounded-full transition-colors",
                theme === "dark"
                  ? "bg-[var(--color-xanban-primary)]"
                  : "bg-[var(--color-xanban-primary)]"
              )}
              onClick={toggleTheme}
            >
              <span
                className={cn(
                  "absolute top-1 h-3 w-3 rounded-full bg-white transition-[left] duration-200",
                  theme === "dark" ? "left-7" : "left-1"
                )}
              />
            </button>
            <Moon className="h-5 w-5 shrink-0 text-[var(--board-text-muted)]" />
          </div>

          {/* Hide Sidebar — left edge flush with sidebar (like Create New Board), right edge aligned with toggle */}
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
        </div>
      </aside>
    </>
  );
}

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
export const SIDEBAR_COLLAPSED_WIDTH_PX = SIDEBAR_COLLAPSED_WIDTH;
