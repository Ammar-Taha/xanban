"use client";

import { useBoardUIStore } from "@/lib/board-ui-store";
import { PanelLeft } from "lucide-react";

/** Floating pill to show the sidebar when it is hidden (desktop). */
export function ShowSidebarButton() {
  const { sidebarOpen, setSidebarOpen } = useBoardUIStore();

  if (sidebarOpen) return null;

  return (
    <button
      type="button"
      onClick={() => setSidebarOpen(true)}
      className="fixed bottom-8 left-0 z-30 hidden items-center justify-center rounded-r-[100px] bg-[var(--color-xanban-primary)] py-4 pl-4 pr-5 transition-colors hover:bg-[var(--color-xanban-primary-hover)] md:flex"
      aria-label="Show sidebar"
    >
      <PanelLeft className="h-5 w-5 text-white" />
    </button>
  );
}
