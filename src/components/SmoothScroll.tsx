"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { Capacitor } from "@capacitor/core";
import { useReducedMotionPreference } from "@/lib/motion/reducedMotion";

// Smoothed mouse-wheel scrolling for the public pages only — the app
// itself keeps the browser's own scroll, which is what a daily tool should
// feel like. Lenis smooths the wheel and leaves touch alone (native
// momentum on a phone is already better than anything a script does), so
// in practice this is a desktop-only touch.
//
// Off entirely when motion is reduced (by the OS or the site's own
// "stop animations" switch, live) and inside the iOS app, which only ever
// shows these pages on the way to signing in.
export default function SmoothScroll() {
  const reduced = useReducedMotionPreference();
  if (reduced || Capacitor.isNativePlatform()) return null;

  return (
    <ReactLenis
      root
      options={{
        // A light hand: settles quickly instead of gliding on.
        lerp: 0.14,
        // Hash links (#pricing etc.) keep working while smoothed.
        anchors: true,
        // Anything that scrolls on its own — the help chat, the accessibility
        // panel, the cookie notice — scrolls natively inside itself.
        allowNestedScroll: true,
      }}
    />
  );
}
