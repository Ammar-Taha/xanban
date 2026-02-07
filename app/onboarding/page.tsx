"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.user_metadata?.onboarding_completed === true) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const completeOnboarding = async () => {
    if (!user) return;
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });
    setIsLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  const handleCreateWorkspace = () => {
    completeOnboarding();
  };

  const handleHaveInvite = () => {
    completeOnboarding();
  };

  if (
    authLoading ||
    (user && user.user_metadata?.onboarding_completed === true)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--board-bg)]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#635FC7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--board-bg)] px-4">
      <div className="w-full max-w-[480px] rounded-xl border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <Image src="/icon.svg" alt="Xanban" width={28} height={28} />
          <span className="text-[18px] font-bold tracking-tight text-[var(--board-text)]">
            Xanban
          </span>
        </div>

        <div className="mt-8 space-y-2 text-center">
          <h1 className="text-[24px] font-bold leading-[1.27] text-[var(--board-text)]">
            Welcome to Xanban
          </h1>
          <p className="text-[13px] font-medium text-[var(--board-text-muted)]">
            Get started by creating a workspace or joining one with an invite.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleCreateWorkspace}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-[24px] bg-[#635FC7] text-[15px] font-bold text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-60"
          >
            Create a new workspace
          </button>
          <button
            type="button"
            onClick={handleHaveInvite}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-[24px] border border-[var(--board-line)] bg-[var(--board-header-bg)] text-[15px] font-bold text-[#635FC7] transition-colors hover:bg-[var(--board-bg)] disabled:opacity-60"
          >
            I have an invite link
          </button>
        </div>
      </div>
    </div>
  );
}
