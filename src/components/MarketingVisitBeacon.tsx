"use client";

import { useEffect } from "react";
import { buildVisitPayload } from "@/lib/marketing/visit";

// Counts a visit that arrives from a marketing link or a social app, once
// per page load (it lives in the root layout, so moving between pages
// inside the site doesn't count again). Nothing is stored in the browser;
// ordinary visits send nothing at all.
let sent = false;

export default function MarketingVisitBeacon() {
  useEffect(() => {
    // Effects can run twice for one load (React dev mode); count it once.
    if (sent) return;
    sent = true;
    const payload = buildVisitPayload(window.location.href, document.referrer || null);
    if (!payload) return;
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // A lost count is not worth bothering the visitor about.
    });
  }, []);
  return null;
}
