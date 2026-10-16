"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

// Vercel Web Analytics: cookieless page-view counts (page, referrer,
// country, device), used to measure what marketing actually brings in.
// Before anything leaves the browser the URL is scrubbed: secret links
// (consent and guardian-report tokens) and per-user ids lose that segment,
// admin pages are never sent, and the only query parameters kept are the
// utm_* tags that say which post or platform a visit came from.

const SECRET_SEGMENTS = [
  /^(\/consent\/)[^/]+/,
  /^(\/guardian-report\/)[^/]+/,
  /^(\/speaking\/chat\/)[^/]+/,
];

function scrub(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (url.pathname.startsWith("/admin")) return null;

  for (const pattern of SECRET_SEGMENTS) {
    url.pathname = url.pathname.replace(pattern, "$1[id]");
  }

  const kept = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (key.startsWith("utm_")) kept.set(key, value);
  });
  url.search = kept.toString();
  url.hash = "";

  return { ...event, url: url.toString() };
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={scrub} />;
}
