"use client";

import { useEffect } from "react";

// Reference-counted body scroll lock. Independent components (the mobile
// nav menu, the support chat panel, any future modal) each call this with
// their own `active` flag instead of writing `document.body.style.overflow`
// directly. Writing it directly is what caused the stuck-scroll bug: two
// unrelated lockers raced on the same property, one's cleanup clobbered the
// other's, and body.style.overflow could end up stuck at "hidden" forever
// with nothing left mounted to clear it — fatal in the native app, whose
// WKWebView instance persists for the whole session instead of reloading.
//
// Only the first lock to activate saves the pre-lock value, and only the
// last one to release restores it, so overlapping locks (e.g. the chat
// opened while the nav menu is still open) never stomp on each other
// regardless of mount/unmount order.
let lockCount = 0;
let savedOverflow: string | null = null;

// Takes one lock and returns its release. Releasing twice is a no-op, so a
// stray double cleanup can never drive the count below zero and unlock a
// page another overlay still holds.
export function acquireBodyScrollLock(): () => void {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount--;
    if (lockCount === 0) {
      document.body.style.overflow = savedOverflow ?? "";
      savedOverflow = null;
    }
  };
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return acquireBodyScrollLock();
  }, [active]);
}
