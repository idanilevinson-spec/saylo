import type { NextConfig } from "next";

// Sent with every response. No Content-Security-Policy yet: the site's
// inline scripts and third-party services would need a full allow-list.
const securityHeaders = [
  // No other site may frame Saylo's pages (clickjacking on sign-in/checkout).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The microphone is for Saylo's own speaking practice only; nothing uses
  // the camera or location.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    // Baked into the browser bundle at build time, so a page can tell which
    // deploy it was loaded from. /api/version reports the deploy that is live
    // now; AppUpdateWatcher compares the two and refreshes when they differ.
    // Vercel sets VERCEL_GIT_COMMIT_SHA on every build; locally it's "dev".
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
