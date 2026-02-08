"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);
    const { error } = await resetPassword(email);
    if (error) setError(error.message);
    else setSuccess(true);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-[480px] rounded-xl border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-sm">
      <div className="flex items-center justify-center gap-2">
        <Image src="/icon.svg" alt="Xanban" width={28} height={28} />
        <span className="text-[18px] font-bold tracking-tight text-[var(--board-text)]">
          Xanban
        </span>
      </div>

      <div className="mt-6 space-y-1 text-center">
        <h1 className="text-[24px] font-bold leading-[1.27] text-[var(--board-text)]">
          Forgot your password?
        </h1>
        <p className="text-[13px] font-medium text-[var(--board-text-muted)]">
          Enter your email and we’ll send you a link to reset it.
        </p>
      </div>

      {success && (
        <div className="mt-4 rounded-lg border border-[var(--board-line)] bg-[var(--board-bg)] px-4 py-3 text-[13px] font-medium text-[var(--board-text)]">
          Check your email for the reset link.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-[#EA5555] bg-[#EA5555]/10 px-4 py-3 text-[13px] font-medium text-[#EA5555]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[12px] font-bold uppercase tracking-widest text-[var(--board-text-muted)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 w-full rounded-md border border-[var(--board-line)] bg-[var(--board-header-bg)] px-4 text-[13px] text-[var(--board-text)] placeholder:text-[var(--board-text-muted)] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="h-12 w-full rounded-[24px] bg-[#635FC7] text-[15px] font-bold text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-60"
        >
          {isLoading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="text-[13px] font-medium text-[#635FC7] hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
