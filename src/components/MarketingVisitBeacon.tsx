"use client";

import { useEffect } from "react";
import { buildVisitPayload } from "@/lib/marketing/visit";
import { arrivalSource, isAppPath } from "@/lib/marketing/funnel";
import { rememberSource, trackStep } from "@/lib/marketing/funnelClient";

// Counts a visit that arrives from a marketing link or a social app, once
// per page load (it lives in the root layout, so moving between pages
// inside the site doesn't count again). Nothing is stored in the browser;
// ordinary visits send nothing to marketing_visits. Every first page on
// the public site is also a "visit" step of the signup funnel, with only
// where it came from (lib/marketing/funnel.ts).
let sent = false;

export default function MarketingVisitBeacon() {
  useEffect(() => {
    // Effects can run twice for one load (React dev mode); count it once.
    if (sent) return;
    sent = true;
    const url = new URL(window.location.href);
    const referrer = document.referrer || null;

    const source = arrivalSource(url.searchParams.get("utm_source"), referrer, url.hostname);
    rememberSource(source);
    if (!isAppPath(url.pathname)) trackStep("visit", url.pathname);

    const payload = buildVisitPayload(window.location.href, referrer);
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
