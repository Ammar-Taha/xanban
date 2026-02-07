"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

type Step = "email" | "verify";

function OtpLoginContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const { signInWithOtp, verifyOtp, user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(initialEmail ? "verify" : "email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const maskEmail = (e: string) => {
    const [user, domain] = e.split("@");
    if (user.length <= 2) return `${user[0]}***@${domain}`;
    return `${user.slice(0, 2)}***@${domain}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { error } = await signInWithOtp(email);
    if (error) setError(error.message);
    else setStep("verify");
    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { error } = await verifyOtp(email, code);
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

      {step === "email" && (
        <>
          <div className="mt-6 space-y-1 text-center">
            <h1 className="text-[24px] font-bold leading-[1.27] text-[#000112]">
              Sign in with email
            </h1>
            <p className="text-[13px] font-medium text-[#828FA3]">
              We’ll send you a 6-digit code to verify your email.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-[#EA5555] bg-[#EA5555]/10 px-4 py-3 text-[13px] font-medium text-[#EA5555]">
              {error}
            </div>
          )}

          <form onSubmit={handleSendCode} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[12px] font-bold uppercase tracking-widest text-[#828FA3]"
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
                disabled={isLoading}
                className="h-11 w-full rounded-md border border-[#E4EBFA] bg-white px-4 text-[13px] text-[#000112] placeholder:text-[#828FA3] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7] disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !email}
              className="h-12 w-full rounded-[24px] bg-[#635FC7] text-[15px] font-bold text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-60"
            >
              {isLoading ? "Sending code…" : "Send verification code"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4EBFA]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-[12px] font-medium uppercase tracking-widest text-[#828FA3]">
                or
              </span>
            </div>
          </div>

          <p className="text-center">
            <Link
              href="/login"
              className="text-[13px] font-bold text-[#635FC7] hover:underline"
            >
              Sign in with password instead
            </Link>
          </p>
        </>
      )}

      {step === "verify" && (
        <>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="mt-4 text-[13px] font-medium text-[#828FA3] hover:text-[#000112]"
          >
            ← Back
          </button>
          <div className="mt-6 space-y-1 text-center">
            <h1 className="text-[24px] font-bold leading-[1.27] text-[#000112]">
              Check your email
            </h1>
            <p className="text-[13px] font-medium text-[#828FA3]">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-[#000112]">
                {email ? maskEmail(email) : "your email"}
              </span>
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-[#EA5555] bg-[#EA5555]/10 px-4 py-3 text-[13px] font-medium text-[#EA5555]">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-[12px] font-bold uppercase tracking-widest text-[#828FA3]"
              >
                Verification code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                disabled={isLoading}
                className="h-12 w-full rounded-md border border-[#E4EBFA] bg-white px-4 text-center text-[18px] font-bold tracking-[0.5em] text-[#000112] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7] disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="h-12 w-full rounded-[24px] bg-[#635FC7] text-[15px] font-bold text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-60"
            >
              {isLoading ? "Verifying…" : "Verify and sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-[12px] font-medium text-[#828FA3]">
            Didn’t get the code?{" "}
            <button
              type="button"
              className="font-bold text-[#635FC7] hover:underline"
              onClick={() => setStep("email")}
            >
              Use another email
            </button>
          </p>
        </>
      )}

      <p className="mt-8 border-t border-[#E4EBFA] pt-6 text-center text-[13px] font-medium text-[#828FA3]">
        No account?{" "}
        <Link href="/signup" className="font-bold text-[#635FC7] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function OtpLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full max-w-[480px] items-center justify-center rounded-xl border border-[#E4EBFA] bg-white p-12 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#635FC7] border-t-transparent" />
        </div>
      }
    >
      <OtpLoginContent />
    </Suspense>
  );
}
