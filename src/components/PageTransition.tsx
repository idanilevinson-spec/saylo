"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

// A cut between pages, not an entrance. An earlier version faded the new
// page in from nothing (opacity 0 → 1 over 300ms), which showed a blank
// screen on every tap on top of the network wait, and was removed. This
// uses the browser's View Transitions instead: the old page stays on screen
// until the new one is ready, then the two crossfade in under 200ms (see
// "Page cut" in globals.css). Nothing is ever blank, and the new page is
// readable from its first frame.
//
// The key still changes with the pathname so a new route remounts and
// per-page state (an answered question, a typed input) never leaks into the
// next one. enter/exit fire only on navigation; default="none" keeps every
// other transition inside a page (form submits, Suspense reveals) still.
// Browsers without View Transitions simply swap the page, as before.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition key={pathname} enter="page-cut-in" exit="page-cut-out" default="none">
      {children}
    </ViewTransition>
  );
}
