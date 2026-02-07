"use client";

import { AuthProvider } from "./providers/auth-provider";
import { ThemeProvider } from "./providers/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}
