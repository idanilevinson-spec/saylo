"use client";

import { useEffect, useRef } from "react";

// Opening titles for the iOS app and the website: the logo assembles itself
// (the bubble arrives, its three dots type, "saylo" writes in, the "o" turns
// into place), a blue cue line runs along the bottom, then the plate fades
// to the page underneath as the logo grows a touch. About 3.4s (the full
// logo holds for about 1.5s), once per visit (see appIntroScript), skipped by a tap, a
// click, a key or the mouse wheel.
//
// Pure CSS (`.app-intro` in globals.css), so it starts on the first frame
// rather than after hydration. Whether it plays is decided before paint by
// `appIntroScript` in layout.tsx, which sets `data-intro` on <html>; without
// that attribute this markup is display:none and its images never load.
// The pieces are cut from the real logo by scripts/build-intro-assets.mjs.

// The exit waits for the page, not the clock. On a phone the page is still
// loading and hydrating at the authored 2.95s, and an animation started on a
// busy main thread reaches the screen late and jumps (the compositor shows it
// already part-way through). So the plate goes at the authored moment or
// later: once the page has loaded and frames are arriving on time again,
// with a ceiling so a slow network never holds people on the logo. The CSS
// keeps a late fade of its own (7s) in case this script never runs.
const EXIT_EARLIEST_MS = 2950;
const EXIT_LATEST_MS = 6000;
// Consecutive frames, each within this many ms of the last, that count as
// "calm". 24ms leaves room for a 60Hz frame and some jitter.
const CALM_FRAMES = 6;
const CALM_FRAME_MS = 24;

export default function AppIntro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || !root.hasAttribute("data-intro")) return;
    // A slow phone can hydrate after the intro already ended (it is CSS and
    // hides itself either way); just tidy up.
    if (el.getAnimations().every((a) => a.playState === "finished")) {
      root.setAttribute("data-intro", "done");
      return;
    }

    // A tap or click on the plate skips it, and on the website so does any
    // key or turn of the mouse wheel: someone who came to read should never
    // have to wait it out. Only while it is still playing: setting "skip"
    // after it ended would bring the plate back for its fade.
    const skip = () => {
      if (root.getAttribute("data-intro") === "play") root.setAttribute("data-intro", "skip");
    };
    const stopListening = () => {
      el.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
    };
    // Time since the intro started: the plate's own animation clock.
    const elapsed = () => Number(el.getAnimations()[0]?.currentTime ?? 0);
    let raf = 0;
    let waitTimer: ReturnType<typeof setTimeout> | undefined;
    const leave = () => {
      cancelAnimationFrame(raf);
      clearTimeout(waitTimer);
      clearTimeout(latestTimer);
      if (root.getAttribute("data-intro") === "play") root.setAttribute("data-intro", "exit");
    };
    const watchForCalm = () => {
      let last = performance.now();
      let calm = 0;
      const tick = (now: number) => {
        calm = now - last <= CALM_FRAME_MS ? calm + 1 : 0;
        last = now;
        if (calm >= CALM_FRAMES) leave();
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const afterLoad = () => {
      waitTimer = setTimeout(watchForCalm, Math.max(0, EXIT_EARLIEST_MS - elapsed()));
    };
    const latestTimer = setTimeout(leave, Math.max(0, EXIT_LATEST_MS - elapsed()));
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    // Only the plate's own exit ends it; the pieces inside finish earlier.
    // Taken off the page a beat after that event, not on it: if the screen
    // runs behind the event, removing the plate on it would cut the exit off
    // mid-way. Until then it is transparent and lets taps through, so the
    // wait costs nothing.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const done = (e: AnimationEvent) => {
      if (e.target === el && /intro-(fallback|exit|skip)/.test(e.animationName)) {
        stopListening();
        timer = setTimeout(() => root.setAttribute("data-intro", "done"), 700);
      }
    };
    el.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    el.addEventListener("animationend", done);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(waitTimer);
      clearTimeout(latestTimer);
      window.removeEventListener("load", afterLoad);
      clearTimeout(timer);
      stopListening();
      el.removeEventListener("animationend", done);
    };
  }, []);

  return (
    <div ref={ref} className="app-intro" aria-hidden="true">
      <div className="app-intro__lockup">
        <span className="app-intro__mark" />
        <span className="app-intro__dot" />
        <span className="app-intro__dot" />
        <span className="app-intro__dot" />
        <span className="app-intro__sayl" />
        <span className="app-intro__o" />
        <span className="app-intro__tagline" />
      </div>
    </div>
  );
}
