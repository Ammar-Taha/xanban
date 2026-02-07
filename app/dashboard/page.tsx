"use client";

import { BoardColumnsView } from "@/components/board/board-columns-view";
import { BoardLayout } from "@/components/board/board-layout";
import { useAuth } from "@/components/providers/auth-provider";
import type { BoardSummary } from "@/lib/board-ui-store";
import { useBoardUIStore } from "@/lib/board-ui-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Dashboard: board layout with sidebar, header, and empty state.
 * New users are redirected to /onboarding first; returning users see the board.
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { selectedBoardId, setSelectedBoardId } = useBoardUIStore();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [columnCount, setColumnCount] = useState(0);

  useEffect(() => {
    if (isLoading || !user) return;
    const completed = user.user_metadata?.onboarding_completed === true;
    if (!completed) {
      router.replace("/onboarding");
    }
  }, [user, isLoading, router]);

  const fetchBoards = useCallback(async () => {
    if (!user?.id) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("boards")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setBoards((data as BoardSummary[]) ?? []);
  }, [user?.id]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Keep selectedBoardId in sync with boards (e.g. select first if none or invalid)
  useEffect(() => {
    if (boards.length === 0) {
      setSelectedBoardId(null);
      return;
    }
    const exists = boards.some((b) => b.id === selectedBoardId);
    if (!exists) setSelectedBoardId(boards[0].id);
  }, [boards, selectedBoardId, setSelectedBoardId]);

  const fetchColumnCount = useCallback(async (boardId: string | null) => {
    if (!boardId) {
      setColumnCount(0);
      return;
    }
    const supabase = createClient();
    const { count } = await supabase
      .from("columns")
      .select("id", { count: "exact", head: true })
      .eq("board_id", boardId);
    setColumnCount(count ?? 0);
  }, []);

  useEffect(() => {
    fetchColumnCount(selectedBoardId);
  }, [selectedBoardId, fetchColumnCount]);

  const handleBoardCreated = useCallback(
    (boardId: string) => {
      setSelectedBoardId(boardId);
      fetchBoards();
      fetchColumnCount(boardId);
    },
    [setSelectedBoardId, fetchBoards, fetchColumnCount]
  );

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);
  const selectedBoardName = selectedBoard?.name ?? null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--board-bg)]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#635FC7] border-t-transparent" />
      </div>
    );
  }

  if (user && user.user_metadata?.onboarding_completed !== true) {
    return null;
  }

  return (
    <BoardLayout
      boards={boards}
      selectedBoardId={selectedBoardId}
      selectedBoardName={selectedBoardName}
      selectedBoardColumnCount={columnCount}
      onBoardCreated={handleBoardCreated}
      onSelectBoard={setSelectedBoardId}
    >
      {selectedBoardId && columnCount > 0 ? (
        <BoardColumnsView boardId={selectedBoardId} />
      ) : undefined}
    </BoardLayout>
  );
}
