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
      boards: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      columns: {
        Row: {
          id: string
          board_id: string
          name: string
          position: number
          wip_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          board_id: string
          name: string
          position?: number
          wip_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string
          position?: number
          wip_limit?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
