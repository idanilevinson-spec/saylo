"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useBodyScrollLock } from "@/lib/utils/scrollLock";

// The phone menu as a side drawer on the reading-start edge (the right, in
// this RTL app). It opens from the ☰ button or by swiping in from that edge,
// the way a native app's drawer does, and closes by swiping it back, tapping
// the dimmed page, or Escape.
//
// While a finger is down the drawer follows it 1:1: positions are written
// straight to the elements' style, no React render per frame. On release a
// quick flick is enough (velocity), not only dragging past halfway.
//
// Edge cases left alone on purpose:
// - The iOS app's own swipe-back lives on the left edge; this uses the right.
// - A swipe that starts on something that scrolls sideways (a carousel, the
//   Bagrut sub-menu) belongs to that element, not to the drawer.
// - Inside a game the edge never opens the menu: a stray swipe mid-round
//   would cost the learner their answer.

const EDGE = 28; // px from the right edge where an opening swipe may start
const INTENT = 10; // px of travel before deciding horizontal vs vertical
const FLICK = 0.11; // px/ms; a faster release counts as a decision on its own
const OPEN_MS = 320;
const CLOSE_MS = 220;
const DRAWER_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

type Drag = {
  startX: number;
  startY: number;
  startTime: number;
  fromOpen: boolean;
  decided: boolean;
  horizontal: boolean;
  width: number;
  lastX: number;
};

function scrollsSideways(target: EventTarget | null): boolean {
  let el = target instanceof Element ? target : null;
  while (el && el !== document.body) {
    if (el.closest("[data-no-edge-swipe]")) return true;
    const style = getComputedStyle(el);
    if ((style.overflowX === "auto" || style.overflowX === "scroll") && el.scrollWidth > el.clientWidth) return true;
    el = el.parentElement;
  }
  return false;
}

export default function MobileNavDrawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useBodyScrollLock(open || dragging);

  // Paint a position: progress 0 = closed, 1 = open.
  const paint = useCallback((progress: number, animate: boolean, ms = OPEN_MS) => {
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (!panel || !scrim) return;
    const transition = animate ? `transform ${ms}ms ${DRAWER_EASE}` : "none";
    panel.style.transition = transition;
    scrim.style.transition = animate ? `opacity ${ms}ms ${DRAWER_EASE}` : "none";
    panel.style.transform = `translateX(${(1 - progress) * 100}%)`;
    scrim.style.opacity = String(progress);
  }, []);

  // The open prop drives the resting position (button, link tap, Escape).
  useEffect(() => {
    if (drag.current) return;
    paint(open ? 1 : 0, true, open ? OPEN_MS : CLOSE_MS);
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus({ preventScroll: true });
    }
  }, [open, paint]);

  // On close, give focus back to the ☰ button, the way a dialog does: the
  // panel turns inert, so focus left inside it would drop to the page's
  // start and a keyboard or screen-reader user would lose their place.
  // Only when focus was in the drawer (or already lost): a tap elsewhere
  // that closed it keeps whatever it focused.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open) {
      const active = document.activeElement;
      const lost = !active || active === document.body || panelRef.current?.contains(active);
      if (lost) document.querySelector<HTMLElement>('[aria-controls="mobile-nav-drawer"]')?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    const inGame = pathname.startsWith("/games/");

    function onStart(e: TouchEvent) {
      if (e.touches.length !== 1 || drag.current) return;
      if (window.innerWidth >= 768) return; // the desktop bar has no drawer
      const t = e.touches[0];
      const isOpen = openRef.current;
      if (!isOpen) {
        if (inGame || t.clientX < window.innerWidth - EDGE || scrollsSideways(e.target)) return;
      }
      const width = panelRef.current?.offsetWidth ?? 0;
      if (!width) return;
      drag.current = {
        startX: t.clientX,
        startY: t.clientY,
        startTime: performance.now(),
        fromOpen: isOpen,
        decided: false,
        horizontal: false,
        width,
        lastX: t.clientX,
      };
      // Only now, with a candidate swipe under the finger, take over
      // touchmove (non-passive, so it can stop the page scrolling). A
      // document-wide non-passive listener would make every scroll on every
      // page wait on this handler.
      document.addEventListener("touchmove", onMove, { passive: false });
    }

    function onMove(e: TouchEvent) {
      const d = drag.current;
      if (!d) return;
      const t = e.touches[0];
      const dx = t.clientX - d.startX;
      const dy = t.clientY - d.startY;
      if (!d.decided) {
        if (Math.abs(dx) < INTENT && Math.abs(dy) < INTENT) return;
        d.decided = true;
        // Opening must move left, closing must move right; anything else,
        // or a mostly vertical move, is a scroll and is let go.
        const rightWay = d.fromOpen ? dx > 0 : dx < 0;
        d.horizontal = rightWay && Math.abs(dx) > Math.abs(dy) * 1.2;
        if (!d.horizontal) {
          drag.current = null;
          document.removeEventListener("touchmove", onMove);
          return;
        }
        setDragging(true);
      }
      e.preventDefault();
      d.lastX = t.clientX;
      const progress = d.fromOpen
        ? 1 - Math.max(0, dx) / d.width
        : Math.min(1, Math.max(0, -dx) / d.width);
      paint(progress, false);
    }

    function onEnd() {
      const d = drag.current;
      drag.current = null;
      document.removeEventListener("touchmove", onMove);
      if (!d || !d.horizontal) return;
      setDragging(false);
      const dx = d.lastX - d.startX;
      const elapsed = Math.max(1, performance.now() - d.startTime);
      const velocity = Math.abs(dx) / elapsed;
      const travelled = Math.abs(dx) / d.width;
      const decided = velocity > FLICK || travelled > 0.4;
      const nextOpen = d.fromOpen ? !decided : decided;
      paint(nextOpen ? 1 : 0, true, nextOpen ? OPEN_MS : CLOSE_MS);
      if (nextOpen !== openRef.current) onOpenChange(nextOpen);
    }

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, [pathname, paint, onOpenChange]);

  const shown = open || dragging;

  return (
    <div className="md:hidden">
      <div
        ref={scrimRef}
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={`fixed inset-0 z-50 bg-black/50 ${shown ? "" : "pointer-events-none"}`}
        style={{ opacity: 0 }}
      />
      <div
        ref={panelRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="תפריט ניווט"
        inert={!shown}
        className={`fixed inset-y-0 start-0 z-50 w-[min(20rem,85vw)] bg-background border-e border-card-border overflow-y-auto overscroll-contain ${
          shown ? "shadow-2xl" : ""
        }`}
        style={{
          transform: "translateX(100%)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
