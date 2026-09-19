"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

// Deliberately does NOT animate. This wraps every in-app navigation, and an
// entrance fade (opacity 0 → 1, 300ms) means each tap on a link or "next
// exercise" shows a blank screen for a third of a second before the page
// appears — on top of the network wait that was already there. Frequent
// actions should feel instant; the keyed Fragment stays because a new
// pathname must still remount the page, so per-page state (an answered
// question, a typed input) never leaks into the next route.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <Fragment key={pathname}>{children}</Fragment>;
}
