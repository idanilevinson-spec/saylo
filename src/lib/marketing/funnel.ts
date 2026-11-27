// The steps between arriving on the site and having an account, counted
// anonymously (see supabase/seed/061_funnel_steps.sql). The database already
// knows everything after signup (profile, placement, practice); before this,
// nothing showed how many people opened the trial lesson, finished it, or
// gave up on the signup form (2026-11-27: 17 arrivals landed on /try and
// nobody could say what happened next).
//
// Shared by the browser (lib/marketing/funnelClient) and the route that
// stores the steps (/api/funnel).

export const FUNNEL_STEPS = [
  // First page of this visit, on the public site (detail: the path).
  "visit",
  // Trial lesson: shown, first answer, end screen, "create account" tapped.
  "try_view",
  "try_start",
  "try_finish",
  "try_signup_click",
  // Signup page: shown, a sign-up button tapped without ticking the terms
  // box, a sign-up sent (detail: email/google/apple), a sign-up error
  // (detail: short reason), waiting for the confirmation mail, account ready.
  "signup_view",
  "signup_terms_blocked",
  "signup_submit",
  "signup_error",
  "signup_email_sent",
  "signup_done",
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export function isFunnelStep(value: unknown): value is FunnelStep {
  return typeof value === "string" && (FUNNEL_STEPS as readonly string[]).includes(value);
}

// App pages (behind sign-in). A first page here is a learner opening the
// app, not someone arriving at the site, so it isn't a "visit". Kept in step
// with PROTECTED_PREFIXES in src/proxy.ts.
export const APP_PREFIXES = [
  "/dashboard",
  "/profile",
  "/learn",
  "/course",
  "/vocabulary",
  "/grammar",
  "/practice",
  "/review",
  "/mistakes",
  "/reading",
  "/listening",
  "/idioms",
  "/placement",
  "/writing",
  "/speaking",
  "/speaking-test",
  "/games",
  "/progress",
  "/patterns",
  "/bagrut",
  "/admin",
  "/auth",
  "/api",
];

export function isAppPath(pathname: string): boolean {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const SEARCH_ENGINES: [RegExp, string][] = [
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)yahoo\./, "yahoo"],
  [/(^|\.)ecosia\.org$/, "ecosia"],
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
];

// Where this visit came from, as one short label: the link's utm_source,
// else the referring site (search engines and AI answers by name), else
// "direct". Only the site's name is kept, never the full referring address.
export function arrivalSource(utmSource: string | null | undefined, referrer: string | null, ownHost: string): string {
  if (utmSource) return utmSource.trim().toLowerCase().slice(0, 40);
  if (!referrer) return "direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "direct";
  }
  if (host === ownHost.replace(/^www\./, "")) return "direct";
  for (const [pattern, name] of SEARCH_ENGINES) if (pattern.test(host)) return name;
  return host.slice(0, 40);
}

// Where a sign-in redirect was taking the visitor (/login?next=…), so a
// link that points at an app page shows up as such. Only a site path is
// kept, never a full address or its query.
export function loginNextPath(search: string): string | null {
  const next = new URLSearchParams(search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next.split(/[?#]/)[0].slice(0, 80);
}

// What one step may carry: a short label or a site path, nothing else.
export function cleanDetail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, 80);
  return /^[a-z0-9_\-/.?=]+$/i.test(v) ? v : null;
}
