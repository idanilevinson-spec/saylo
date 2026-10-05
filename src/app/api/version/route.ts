import { NextResponse } from "next/server";

// Which deploy is live right now — compared against the build a page was
// loaded from (NEXT_PUBLIC_BUILD_ID) by AppUpdateWatcher. Must never be
// cached anywhere, or a stale answer would hide a new deploy.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { buildId: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
