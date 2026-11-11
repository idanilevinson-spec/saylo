// Which visits count as "arrived from marketing", and what is kept about
// them (see supabase/seed/055_marketing_visits.sql). Shared by the browser
// beacon (MarketingVisitBeacon) and the route that stores it (/api/visit).

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

// Hosts the social apps and their link wrappers send as the referrer.
const SOCIAL_HOSTS = [
  "instagram.com",
  "l.instagram.com",
  "facebook.com",
  "m.facebook.com",
  "l.facebook.com",
  "lm.facebook.com",
  "tiktok.com",
  "vm.tiktok.com",
  "youtube.com",
  "m.youtube.com",
  "t.co",
  "x.com",
  "linkedin.com",
  "lnkd.in",
  "threads.net",
  "wa.me",
  "whatsapp.com",
];

const MAX_VALUE = 100;

export function socialHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");
  return SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ? host : null;
}

export function pickUtm(params: URLSearchParams): Partial<Record<UtmKey, string>> {
  const out: Partial<Record<UtmKey, string>> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[key] = value.slice(0, MAX_VALUE).toLowerCase();
  }
  return out;
}

export type VisitPayload = Partial<Record<UtmKey, string>> & {
  path: string;
  referrerHost: string | null;
};

// What the browser sends, or null when this page load is not a marketing
// arrival (no utm tag and not from a social app), so nothing is sent at all.
export function buildVisitPayload(href: string, referrer: string | null): VisitPayload | null {
  const url = new URL(href);
  if (url.pathname.startsWith("/admin")) return null;
  const utm = pickUtm(url.searchParams);
  const referrerHost = socialHost(referrer);
  if (Object.keys(utm).length === 0 && !referrerHost) return null;
  return { ...utm, path: url.pathname.slice(0, 200), referrerHost };
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|meta-externalagent|headless|lighthouse|curl|wget|python-requests|httpclient/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function deviceFromUserAgent(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}
