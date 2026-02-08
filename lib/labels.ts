/**
 * Label color palette for user-created labels.
 * Stored in public.labels.color (TEXT).
 */
export const LABEL_COLORS = [
  "#49C4E5",
  "#635FC7",
  "#67E2AE",
  "#F2C94C",
  "#EB5757",
  "#FF9F1A",
  "#6FCF97",
  "#9B51E0",
] as const;

export type LabelColor = (typeof LABEL_COLORS)[number];

export type Label = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at?: string;
};
