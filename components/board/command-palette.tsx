"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

export type CommandPaletteItem = {
  id: string;
  label: string;
  shortcut?: string;
  onSelect: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  commands: CommandPaletteItem[];
};

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  const runCommand = useCallback(
    (item: CommandPaletteItem) => {
      onClose();
      setQuery("");
      setSelectedIndex(0);
      item.onSelect();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedIndex(0);
  }, [open]);

  useEffect(() => {
    setSelectedIndex((i) => (filtered.length ? Math.min(i, filtered.length - 1) : 0));
  }, [filtered.length]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(1, filtered.length));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length));
        return;
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        runCommand(filtered[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, filtered, selectedIndex, runCommand]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-[18%] z-[101] w-full max-w-md -translate-x-1/2 rounded-xl border border-[var(--board-line)] bg-[var(--board-header-bg)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command..."
          className="w-full rounded-t-xl border-b border-[var(--board-line)] bg-transparent px-4 py-3 text-[15px] text-[var(--board-text)] placeholder:text-[var(--board-text-muted)] focus:outline-none"
          autoFocus
        />
        <ul className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-[13px] text-[var(--board-text-muted)]">
              No matching commands
            </li>
          ) : (
            filtered.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => runCommand(item)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-[14px] transition-colors",
                    i === selectedIndex
                      ? "bg-[var(--color-xanban-primary)]/15 text-[var(--color-xanban-primary)]"
                      : "text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                  )}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <kbd className="rounded border border-[var(--board-line)] bg-[var(--board-bg)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--board-text-muted)]">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}
