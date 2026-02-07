"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    options?: { display_name?: string }
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (
    email: string,
    token: string
  ) => Promise<{ error: AuthError | null }>;
  resendOtp: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Production app URL; must match redirect URL in Supabase and app/auth/callback/route.ts */
const PRODUCTION_ORIGIN = "https://xanban-lime.vercel.app";

function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? PRODUCTION_ORIGIN;
}

function getAuthCallbackUrl(): string {
  return `${getAppOrigin()}/auth/callback`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      // Validate session with server (getUser). getSession() alone reads from
      // storage and can leave deleted/invalid users appearing logged in.
      const {
        data: { user: serverUser },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !serverUser) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session ?? null);
        setUser(serverUser);
      }
      setIsLoading(false);
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      router.push("/dashboard");
      router.refresh();
    }
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    opts?: { display_name?: string }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
        data: opts?.display_name
          ? { display_name: opts.display_name.trim() }
          : undefined,
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });
    return { error };
  };

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (!error) {
      router.push("/dashboard");
      router.refresh();
    }
    return { error };
  };

  const resendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppOrigin()}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      router.push("/dashboard");
      router.refresh();
    }
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithOtp,
    verifyOtp,
    resendOtp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
