# Xanban Supabase schema

Single source of truth for the database: run **`schema.sql`** in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) to create tables, indexes, foreign keys, and RLS policies.

## Contents

| File        | Purpose |
|------------|---------|
| `schema.sql` | Full schema: tables, indexes, FKs, RLS. Safe to re-run (policies are dropped then recreated). |
| `README.md`  | This file. |

## Tables

- **boards** — User-owned; name, timestamps.
- **columns** — Per board; name, position, optional `wip_limit`.
- **cards** — Per column; title, description, due_date, priority, position, is_archived.
- **labels** — User-owned; name, optional color (reusable across boards).
- **card_labels** — Many-to-many card ↔ label.
- **subtasks** — Per card; title, is_completed, position (checklist).

## RLS (Row Level Security)

Pattern matches the ToNote reference app: every table has RLS enabled and one policy per operation (SELECT, INSERT, UPDATE, DELETE) so each user only sees and changes their own data. Nested resources (columns, cards, card_labels, subtasks) enforce ownership via the board’s `user_id`.

## After running the schema

1. In Supabase Dashboard → Table Editor, confirm the tables exist.
2. In Authentication → Policies (or SQL), confirm RLS is enabled and policies are present.
3. Regenerate TypeScript types when needed:  
   `npx supabase gen types typescript --project-id <your-project-ref> > types/database.types.ts`
