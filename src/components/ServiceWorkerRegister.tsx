"use client";

import { useEffect } from "react";

// Registers the push-notification service worker once on mount. Silently
// no-ops in browsers without support (Safari <16, some in-app webviews).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
