import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Baked into the browser bundle at build time, so a page can tell which
    // deploy it was loaded from. /api/version reports the deploy that is live
    // now; AppUpdateWatcher compares the two and refreshes when they differ.
    // Vercel sets VERCEL_GIT_COMMIT_SHA on every build; locally it's "dev".
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  },
};

export default nextConfig;
