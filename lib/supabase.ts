import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Plain Supabase client (no cookie/session context).
 * Use for Server Actions, API routes, or one-off server code when you don't need the request's auth session.
 * For browser or request-scoped server code with session, use lib/supabase/client.ts or server.ts instead.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
