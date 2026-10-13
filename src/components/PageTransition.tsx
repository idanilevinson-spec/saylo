"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

// Deliberately does NOT animate. Two attempts, both removed:
// - an entrance fade (opacity 0 → 1, 300ms) showed a blank screen on every
//   tap on top of the network wait;
// - a View Transitions crossfade (PR #133) never went blank, but on iPhone
//   it still felt stuck: the browser snapshots the whole page before the cut
//   starts, and React holds the commit until the new page's images load.
// Frequent actions should feel instant. The keyed Fragment stays because a
// new pathname must still remount the page, so per-page state (an answered
// question, a typed input) never leaks into the next route.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <Fragment key={pathname}>{children}</Fragment>;
}
