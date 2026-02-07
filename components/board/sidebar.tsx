"use client";

import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useBoardUIStore } from "@/lib/board-ui-store";
import { EyeOff, LayoutDashboard, LogOut, Moon, Plus, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const SIDEBAR_WIDTH = 300;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export function Sidebar({
  boardCount = 0,
  className,
}: {
  boardCount?: number;
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen, setAddBoardModalOpen } = useBoardUIStore();
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

          {/* Boards section: full when open, compact when collapsed */}
          {sidebarOpen ? (
            <>
              <p className="mt-12 px-8 text-[12px] font-bold uppercase leading-[1.26] tracking-[0.2em] text-[var(--board-text-muted)]">
                All boards ({boardCount})
              </p>
              <div className="mt-4 flex flex-col gap-1 pr-8">
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

          {/* User menu: email + sign out on hover; padding extends hover zone so panel stays open */}
          {user && (
            <div
              className={cn(
                "relative",
                sidebarOpen ? "mx-6 mb-3" : "mb-3 flex justify-center",
                userMenuOpen &&
                (sidebarOpen ? "pt-[100px] -mt-[100px]" : "pr-[220px] -mr-[220px]")
              )}
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center gap-3 rounded-lg text-[var(--board-text-muted)] transition-colors hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]",
                  sidebarOpen
                    ? "w-full px-3 py-2.5 text-left"
                    : "h-10 w-10 justify-center"
                )}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="Account menu"
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
              {userMenuOpen && (
                <div
                  className={cn(
                    "absolute z-50 min-w-[200px] rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-3 shadow-lg",
                    sidebarOpen
                      ? "bottom-full left-0 right-0 mb-1"
                      : "bottom-0 left-full ml-2"
                  )}
                  role="menu"
                >
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
                </div>
              )}
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
