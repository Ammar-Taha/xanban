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
  const { selectedBoardId, setSelectedBoardId, setAddColumnModalOpen } = useBoardUIStore();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

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
    // Prefer position order (after migration); fallback to updated_at/created_at for legacy schemas.
    const { data, error } = await supabase
      .from("boards")
      .select("id, name")
      .eq("user_id", user.id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      const fallback = await supabase
        .from("boards")
        .select("id, name")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: true })
        .order("created_at", { ascending: true });
      setBoards((fallback.data as BoardSummary[]) ?? []);
      return;
    }
    setBoards((data as BoardSummary[]) ?? []);
  }, [user?.id]);

  const handleReorderBoards = useCallback(
    async (orderedIds: string[]) => {
      if (!user?.id || orderedIds.length === 0) return;
      const nextBoards = orderedIds
        .map((id) => boards.find((b) => b.id === id))
        .filter((b): b is BoardSummary => !!b);
      const previousBoards = boards;
      if (nextBoards.length === boards.length) {
        setBoards(nextBoards);
      }

      const supabase = createClient();
      try {
        const responses = await Promise.all(
          orderedIds.map((id, position) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types incomplete
            (supabase.from("boards") as any)
              .update({ position })
              .eq("id", id)
              .eq("user_id", user.id)
          )
        );
        const firstError = responses.find((res) => res?.error)?.error;
        if (firstError) {
          const message = `${firstError.message ?? ""}`.toLowerCase();
          if (message.includes("position")) {
            // Legacy fallback when boards.position doesn't exist yet:
            // persist visual order through updated_at so fetch fallback keeps the reordered list.
            const baseTime = Date.now();
            const legacyResponses = await Promise.all(
              orderedIds.map((id, index) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types incomplete
                (supabase.from("boards") as any)
                  .update({ updated_at: new Date(baseTime + index).toISOString() })
                  .eq("id", id)
                  .eq("user_id", user.id)
              )
            );
            const legacyError = legacyResponses.find((res) => res?.error)?.error;
            if (!legacyError) {
              return;
            }
            throw legacyError;
          }
          throw firstError;
        }
      } catch (error) {
        console.error("Failed to reorder boards", error);
        setBoards(previousBoards);
      } finally {
        fetchBoards();
      }
    },
    [boards, fetchBoards, user?.id]
  );

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

  const handleBoardCreated = useCallback(
    (boardId: string) => {
      setSelectedBoardId(boardId);
      fetchBoards();
    },
    [setSelectedBoardId, fetchBoards]
  );

  const handleBoardDeleted = useCallback(() => {
    fetchBoards();
    setBoardRefreshKey((k) => k + 1);
  }, [fetchBoards]);

  const handleBoardUpdated = useCallback(() => {
    fetchBoards();
    setBoardRefreshKey((k) => k + 1);
  }, [fetchBoards]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);
  const selectedBoardName = selectedBoard?.name ?? null;

  const handleTaskCreated = useCallback(() => {
    setBoardRefreshKey((k) => k + 1);
  }, []);

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
      onBoardCreated={handleBoardCreated}
      onBoardDeleted={handleBoardDeleted}
      onBoardUpdated={handleBoardUpdated}
      onReorderBoards={handleReorderBoards}
      onSelectBoard={setSelectedBoardId}
      onTaskCreated={handleTaskCreated}
      onColumnAdded={handleTaskCreated}
    >
      {selectedBoardId ? (
        <BoardColumnsView
          key={boardRefreshKey}
          boardId={selectedBoardId}
          onAddColumn={() => setAddColumnModalOpen(true)}
        />
      ) : undefined}
    </BoardLayout>
  );
}
