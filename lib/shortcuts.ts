/**
 * Shortcut display strings that respect all OS: Windows (Ctrl) first, then Mac (⌘).
 * Use these for UI labels and command palette so users see both conventions.
 */
export const SHORTCUTS = {
  /** Open command palette */
  commandPalette: "Ctrl+K / ⌘K",
  /** Add new task */
  addTask: "N",
  /** Search tasks (same as command palette) */
  search: "Ctrl+K / ⌘K",
  /** Board options menu */
  boardOptions: "Ctrl+B / ⌘B",
  /** Add new column */
  addColumn: "Ctrl+Shift+C / ⌘⇧C",
  /** Manage labels */
  manageLabels: "Ctrl+Shift+L / ⌘⇧L",
  /** Toggle sidebar */
  toggleSidebar: "Ctrl+\\ / ⌘\\",
  /** Create new board */
  createBoard: "Ctrl+Shift+B / ⌘⇧B",
} as const;
