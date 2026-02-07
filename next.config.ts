import type { NextConfig } from "next";

/** Redirects for legacy /app paths; typed to satisfy Next.js config validator */
const legacyRedirects: Array<{
  source: string;
  destination: string;
  permanent: boolean;
}> = [
  { source: "/app", destination: "/dashboard", permanent: true },
  { source: "/app/onboarding", destination: "/onboarding", permanent: true },
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
