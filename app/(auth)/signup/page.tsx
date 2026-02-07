"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.push("/dashboard");
  }, [user, authLoading, router]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }
    const { error } = await signUp(email, password, {
      display_name: displayName.trim() || undefined,
    });
    if (error) setError(error.message);
    else setSuccess(true);
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
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
          Create your account
        </h1>
        <p className="text-[13px] font-medium text-[#828FA3]">
          Sign up to start managing tasks with boards and cards.
        </p>
      </div>

      {success && (
        <div className="mt-4 rounded-lg border border-green-500/50 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-800">
          Check your email to confirm your account.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-[#EA5555] bg-[#EA5555]/10 px-4 py-3 text-[13px] font-medium text-[#EA5555]">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSignUp} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="text-[12px] font-bold uppercase tracking-widest text-[#828FA3]"
          >
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            placeholder="How we'll show you in the app"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-11 w-full rounded-md border border-[#E4EBFA] bg-white px-4 text-[13px] text-[#000112] placeholder:text-[#828FA3] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
          />
        </div>

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
            className="h-11 w-full rounded-md border border-[#E4EBFA] bg-white px-4 text-[13px] text-[#000112] placeholder:text-[#828FA3] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-[12px] font-bold uppercase tracking-widest text-[#828FA3]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 w-full rounded-md border border-[#E4EBFA] bg-white px-4 pr-10 text-[13px] text-[#000112] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828FA3] hover:text-[#000112]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          <p className="text-[12px] font-medium text-[#828FA3]">
            At least 8 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="h-12 w-full rounded-[24px] bg-[#635FC7] text-[15px] font-bold text-white transition-colors hover:bg-[#A8A4FF] disabled:opacity-60"
        >
          {isLoading ? "Signing up…" : "Sign up"}
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

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={success}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[20px] border border-[#E4EBFA] bg-white text-[13px] font-bold text-[#000112] transition-colors hover:bg-[#F4F7FD] disabled:opacity-60"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 border-t border-[#E4EBFA] pt-6 text-center text-[13px] font-medium text-[#828FA3]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[#635FC7] hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
