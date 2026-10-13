"use client";

import { useEffect, useRef } from "react";

// Opening titles for the iOS app: the logo assembles itself (the bubble
// arrives, its three dots type, "saylo" writes in, the "o" turns into place),
// a blue cue line runs along the bottom and the whole plate lifts away to
// the page underneath. About 2.4s, once per app launch, tap anywhere to skip.
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

    const skip = () => root.setAttribute("data-intro", "skip");
    // Only the plate's own exit ends it; the pieces inside finish earlier.
    const done = (e: AnimationEvent) => {
      if (e.target === el && /intro-(lift|skip)/.test(e.animationName)) root.removeAttribute("data-intro");
    };
    el.addEventListener("pointerdown", skip);
    el.addEventListener("animationend", done);
    return () => {
      el.removeEventListener("pointerdown", skip);
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
