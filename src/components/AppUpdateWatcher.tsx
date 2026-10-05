"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isNewerDeploy, MIN_CHECK_INTERVAL_MS, shouldReloadOnReturn } from "@/lib/appUpdate";

const LOADED_BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

let lastCheck = 0;
let updatePending = false;

// Asks which deploy is live. Rate-limited, and silent on failure (offline,
// timeout): the next return to the app or page change tries again.
async function checkForUpdate(awayMs: number) {
  if (LOADED_BUILD_ID === "dev" || updatePending) return;
  if (Date.now() - lastCheck < MIN_CHECK_INTERVAL_MS) return;
  lastCheck = Date.now();
  try {
    const res = await fetch("/api/version", { cache: "no-store" });
    if (!res.ok) return;
    const { buildId } = (await res.json()) as { buildId?: unknown };
    if (!isNewerDeploy(LOADED_BUILD_ID, buildId)) return;
    if (shouldReloadOnReturn(awayMs)) window.location.reload();
    else updatePending = true;
  } catch {
    // Try again next time.
  }
}

// Keeps the iOS app (and long-open tabs) on the latest deploy without
// interrupting anyone mid-task — see src/lib/appUpdate.ts for the rules.
// Checks when the app comes back to the screen (WKWebView fires
// visibilitychange on resume, same as a browser tab) and on page changes,
// for someone who keeps the app open without ever leaving it.
export default function AppUpdateWatcher() {
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;
    // A newer deploy was noticed earlier: the person just left the previous
    // screen, so turn this page change into a full load of the new version.
    if (updatePending) window.location.reload();
    else void checkForUpdate(0);
  }, [pathname]);

  useEffect(() => {
    let hiddenAt: number | null = null;
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      const awayMs = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      void checkForUpdate(awayMs);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}
