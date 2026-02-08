/** Default label color when creating; user can pick any color via color picker. */
export const DEFAULT_LABEL_COLOR = "#635FC7";

export type Label = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at?: string;
};
