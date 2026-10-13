"use client";

import { useEffect, useRef } from "react";

// Opening titles for the iOS app and the website: the logo assembles itself
// (the bubble arrives, its three dots type, "saylo" writes in, the "o" turns
// into place), a blue cue line runs along the bottom and the whole plate
// lifts away to the page underneath. About 3.45s (the full logo holds for
// about 1.5s), once per visit (see appIntroScript), skipped by a tap, a
// click, a key or the mouse wheel.
//
// Pure CSS (`.app-intro` in globals.css), so it starts on the first frame
// rather than after hydration. Whether it plays is decided before paint by
// `appIntroScript` in layout.tsx, which sets `data-intro` on <html>; without
// that attribute this markup is display:none and its images never load.
// The pieces are cut from the real logo by scripts/build-intro-assets.mjs.

export default function AppIntro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || !root.hasAttribute("data-intro")) return;
    // A slow phone can hydrate after the intro already ended (it is CSS and
    // hides itself either way); just tidy up.
    if (el.getAnimations().every((a) => a.playState === "finished")) {
      root.removeAttribute("data-intro");
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
    // Only the plate's own exit ends it; the pieces inside finish earlier.
    const done = (e: AnimationEvent) => {
      if (e.target === el && /intro-(lift|skip)/.test(e.animationName)) {
        root.removeAttribute("data-intro");
        stopListening();
      }
    };
    el.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    el.addEventListener("animationend", done);
    return () => {
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
