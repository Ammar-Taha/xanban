"use client";

import { BoardLayout } from "@/components/board/board-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Main app view: board layout with sidebar, header, and empty state.
 * New users are redirected to onboarding first; returning users see the board.
 */
export default function AppPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    const completed = user.user_metadata?.onboarding_completed === true;
    if (!completed) {
      router.replace("/app/onboarding");
    }
  }, [user, isLoading, router]);

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
      boardCount={0}
    />
  );
}
