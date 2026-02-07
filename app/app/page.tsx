"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Temporary post-auth view for testing the authentication workflow in production.
 * Replace with the real app (e.g. board list) in Phase 3.
 */
export default function AppPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7FD] px-6">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-[#E4EBFA] bg-white p-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/icon.svg" alt="" width={40} height={40} />
          <span className="text-[24px] font-bold tracking-tight text-[#000112]">
            Xanban
          </span>
        </div>
        <p className="text-[13px] font-medium text-[#828FA3]">
          You’re signed in
          {user?.email && (
            <span className="mt-1 block text-[#000112]">{user.email}</span>
          )}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-[20px] border border-[#E4EBFA] bg-white px-5 py-2.5 text-[13px] font-bold text-[#635FC7] transition-colors hover:bg-[#F4F7FD]"
          >
            Sign out
          </button>
          <Link
            href="/"
            className="rounded-[20px] border border-[#E4EBFA] bg-white px-5 py-2.5 text-center text-[13px] font-medium text-[#828FA3] transition-colors hover:bg-[#F4F7FD]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
