/**
 * Card due date & priority helpers.
 * Schema: cards.due_date (DATE NULL), cards.priority ('none' | 'low' | 'medium' | 'high')
 */

export type CardPriority = "none" | "low" | "medium" | "high";

export const CARD_PRIORITIES: { value: CardPriority; label: string }[] = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

/** Format YYYY-MM-DD for display (e.g. "Mar 15, 2025") */
export function formatDueDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Whether the due date is before today (overdue) */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T12:00:00");
  return due < today;
}

export const PRIORITY_STYLES: Record<CardPriority, string> = {
  none: "text-[var(--board-text-muted)]",
  low: "text-[var(--board-text-muted)]",
  medium: "text-[#FF9F1A]",
  high: "text-[#EA5555]",
};
