"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) setError(error.message);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-[480px] rounded-xl border border-[#E4EBFA] bg-white p-8 shadow-sm">
      <div className="flex items-center justify-center gap-2">
        <Image src="/icon.svg" alt="Xanban" width={28} height={28} />
        <span className="text-[18px] font-bold tracking-tight text-[#000112]">
          Xanban
        </span>
      </div>

      <div className="mt-6 space-y-1 text-center">
        <h1 className="text-[24px] font-bold leading-[1.27] text-[#000112]">
          Reset your password
        </h1>
        <p className="text-[13px] font-medium text-[#828FA3]">
          Choose a new password for your account.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-[#EA5555] bg-[#EA5555]/10 px-4 py-3 text-[13px] font-medium text-[#EA5555]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-[12px] font-bold uppercase tracking-widest text-[#828FA3]"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="h-11 w-full rounded-md border border-[#E4EBFA] bg-white px-4 pr-10 text-[13px] text-[#000112] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828FA3] hover:text-[#000112]"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? "🙈" : "👁"}
            </button>
          </div>
          <p className="text-[12px] font-medium text-[#828FA3]">
            At least 8 characters
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-[12px] font-bold uppercase tracking-widest text-[#828FA3]"
          >
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11 w-full rounded-md border border-[#E4EBFA] bg-white px-4 pr-10 text-[13px] text-[#000112] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828FA3] hover:text-[#000112]"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-[24px] bg-[#635FC7] text-[15px] font-bold text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-60"
        >
          {isLoading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
