// Database types for Supabase (Xanban)
// Regenerate with: npx supabase gen types typescript --project-id <ref> > types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Add boards, columns, cards, etc. when schema is ready
      [_: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
  }
}
