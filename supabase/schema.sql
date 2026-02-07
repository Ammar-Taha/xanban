-- =============================================================================
-- XANBAN DATABASE SCHEMA - COMPLETE SETUP
-- Single source of truth for database schema with best practices
-- Run this in Supabase SQL Editor to set up everything correctly
-- Reference: ToNote schema pattern (RLS, FKs, indexes)
-- =============================================================================

-- =============================================================================
-- 1. BOARDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boards_user_id ON public.boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_updated_at ON public.boards(updated_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'boards_user_id_fkey'
  ) THEN
    ALTER TABLE public.boards
      ADD CONSTRAINT boards_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can create their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;

CREATE POLICY "Users can view their own boards"
ON public.boards FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own boards"
ON public.boards FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own boards"
ON public.boards FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own boards"
ON public.boards FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- =============================================================================
-- 2. COLUMNS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  wip_limit INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_columns_board_id ON public.columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_board_position ON public.columns(board_id, position);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'columns_board_id_fkey'
  ) THEN
    ALTER TABLE public.columns
      ADD CONSTRAINT columns_board_id_fkey
      FOREIGN KEY (board_id)
      REFERENCES public.boards(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view columns of their boards" ON public.columns;
DROP POLICY IF EXISTS "Users can create columns on their boards" ON public.columns;
DROP POLICY IF EXISTS "Users can update columns of their boards" ON public.columns;
DROP POLICY IF EXISTS "Users can delete columns of their boards" ON public.columns;

CREATE POLICY "Users can view columns of their boards"
ON public.columns FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can create columns on their boards"
ON public.columns FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can update columns of their boards"
ON public.columns FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_id AND b.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can delete columns of their boards"
ON public.columns FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_id AND b.user_id = (SELECT auth.uid())
  )
);

-- =============================================================================
-- 3. CARDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date DATE NULL,
  priority TEXT DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
  position INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_column_id ON public.cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_column_position ON public.cards(column_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_due_date ON public.cards(due_date);
CREATE INDEX IF NOT EXISTS idx_cards_is_archived ON public.cards(is_archived);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cards_column_id_fkey'
  ) THEN
    ALTER TABLE public.cards
      ADD CONSTRAINT cards_column_id_fkey
      FOREIGN KEY (column_id)
      REFERENCES public.columns(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view cards in their boards" ON public.cards;
DROP POLICY IF EXISTS "Users can create cards in their boards" ON public.cards;
DROP POLICY IF EXISTS "Users can update cards in their boards" ON public.cards;
DROP POLICY IF EXISTS "Users can delete cards in their boards" ON public.cards;

CREATE POLICY "Users can view cards in their boards"
ON public.cards FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.columns c
    JOIN public.boards b ON b.id = c.board_id
    WHERE c.id = column_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can create cards in their boards"
ON public.cards FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.columns c
    JOIN public.boards b ON b.id = c.board_id
    WHERE c.id = column_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can update cards in their boards"
ON public.cards FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.columns c
    JOIN public.boards b ON b.id = c.board_id
    WHERE c.id = column_id AND b.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.columns c
    JOIN public.boards b ON b.id = c.board_id
    WHERE c.id = column_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can delete cards in their boards"
ON public.cards FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.columns c
    JOIN public.boards b ON b.id = c.board_id
    WHERE c.id = column_id AND b.user_id = (SELECT auth.uid())
  )
);

-- =============================================================================
-- 4. LABELS (user-scoped, reusable across boards)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_labels_user_id ON public.labels(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'labels_user_id_fkey'
  ) THEN
    ALTER TABLE public.labels
      ADD CONSTRAINT labels_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own labels" ON public.labels;
DROP POLICY IF EXISTS "Users can create their own labels" ON public.labels;
DROP POLICY IF EXISTS "Users can update their own labels" ON public.labels;
DROP POLICY IF EXISTS "Users can delete their own labels" ON public.labels;

CREATE POLICY "Users can view their own labels"
ON public.labels FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own labels"
ON public.labels FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own labels"
ON public.labels FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own labels"
ON public.labels FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- =============================================================================
-- 5. CARD_LABELS (many-to-many)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.card_labels (
  card_id UUID NOT NULL,
  label_id UUID NOT NULL,
  PRIMARY KEY (card_id, label_id)
);

CREATE INDEX IF NOT EXISTS idx_card_labels_card_id ON public.card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_label_id ON public.card_labels(label_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'card_labels_card_id_fkey'
  ) THEN
    ALTER TABLE public.card_labels
      ADD CONSTRAINT card_labels_card_id_fkey
      FOREIGN KEY (card_id)
      REFERENCES public.cards(id)
      ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'card_labels_label_id_fkey'
  ) THEN
    ALTER TABLE public.card_labels
      ADD CONSTRAINT card_labels_label_id_fkey
      FOREIGN KEY (label_id)
      REFERENCES public.labels(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.card_labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view card_labels for their cards" ON public.card_labels;
DROP POLICY IF EXISTS "Users can create card_labels for their cards" ON public.card_labels;
DROP POLICY IF EXISTS "Users can delete card_labels for their cards" ON public.card_labels;

CREATE POLICY "Users can view card_labels for their cards"
ON public.card_labels FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
  AND
  (SELECT auth.uid()) = (SELECT user_id FROM public.labels WHERE id = label_id)
);

CREATE POLICY "Users can create card_labels for their cards"
ON public.card_labels FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
  AND
  (SELECT auth.uid()) = (SELECT user_id FROM public.labels WHERE id = label_id)
);

CREATE POLICY "Users can delete card_labels for their cards"
ON public.card_labels FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
  AND
  (SELECT auth.uid()) = (SELECT user_id FROM public.labels WHERE id = label_id)
);

-- =============================================================================
-- 6. SUBTASKS (checklist on a card)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_card_id ON public.subtasks(card_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_card_position ON public.subtasks(card_id, position);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subtasks_card_id_fkey'
  ) THEN
    ALTER TABLE public.subtasks
      ADD CONSTRAINT subtasks_card_id_fkey
      FOREIGN KEY (card_id)
      REFERENCES public.cards(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view subtasks of their cards" ON public.subtasks;
DROP POLICY IF EXISTS "Users can create subtasks on their cards" ON public.subtasks;
DROP POLICY IF EXISTS "Users can update subtasks of their cards" ON public.subtasks;
DROP POLICY IF EXISTS "Users can delete subtasks of their cards" ON public.subtasks;

CREATE POLICY "Users can view subtasks of their cards"
ON public.subtasks FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can create subtasks on their cards"
ON public.subtasks FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can update subtasks of their cards"
ON public.subtasks FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can delete subtasks of their cards"
ON public.subtasks FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards card
    JOIN public.columns c ON c.id = card.column_id
    JOIN public.boards b ON b.id = c.board_id
    WHERE card.id = card_id AND b.user_id = (SELECT auth.uid())
  )
);

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
--
-- Tables: boards, columns, cards, labels, card_labels, subtasks
-- All tables have RLS enabled and policies for SELECT, INSERT, UPDATE, DELETE
-- (card_labels has no UPDATE; use DELETE + INSERT to change)
-- Foreign keys: user -> boards/labels; board -> columns; column -> cards; card -> card_labels, subtasks
-- Run in Supabase SQL Editor once to create schema. Re-run to refresh policies.
-- =============================================================================
