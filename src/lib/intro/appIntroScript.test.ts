import { describe, expect, it } from "vitest";
import { appIntroScript } from "./appIntroScript";

// Runs the inline script against a fake page and reports whether it decided
// to play the intro.
function run({
  path = "/",
  search = "",
  ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
  seen = false,
  reload = false,
  reducedMotion = false,
  stopAnimations = false,
  referrer = "",
} = {}) {
  const attrs: Record<string, string> = {};
  const session: Record<string, string> = seen ? { "saylo-intro-seen": "1" } : {};
  const local: Record<string, string> = stopAnimations ? { "saylo-a11y-prefs": JSON.stringify({ stopAnimations: true }) } : {};
  const document = { referrer, documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
  const location = { pathname: path, search };
  const navigator = { userAgent: ua };
  const sessionStorage = { getItem: (k: string) => session[k] ?? null, setItem: (k: string, v: string) => (session[k] = v) };
  const localStorage = { getItem: (k: string) => local[k] ?? null };
  const performance = { getEntriesByType: () => [{ type: reload ? "reload" : "navigate" }] };
  const matchMedia = () => ({ matches: reducedMotion });
  new Function("document", "location", "navigator", "sessionStorage", "localStorage", "performance", "matchMedia", appIntroScript)(
    document,
    location,
    navigator,
    sessionStorage,
    localStorage,
    performance,
    matchMedia
  );
  return { plays: attrs["data-intro"] === "play", session };
}

describe("appIntroScript", () => {
  it("plays on a first visit to the website, and marks the visit", () => {
    const r = run();
    expect(r.plays).toBe(true);
    expect(r.session["saylo-intro-seen"]).toBe("1");
  });

  it("plays on any entry page, the app's included", () => {
    expect(run({ path: "/english-grammar/verb-to-be" }).plays).toBe(true);
    expect(run({ path: "/dashboard" }).plays).toBe(true);
  });

  it("does not replay within the same visit or on a reload", () => {
    expect(run({ seen: true }).plays).toBe(false);
    expect(run({ reload: true }).plays).toBe(false);
  });

  it("stays out of pages reached from an email and the admin", () => {
    for (const path of ["/auth/confirm", "/reset-password/confirm", "/consent/abc", "/guardian-report/xyz", "/admin"]) {
      expect(run({ path }).plays, path).toBe(false);
    }
    expect(run({ path: "/authors" }).plays).toBe(true);
  });

  it("lets crawlers and link previews see the page", () => {
    for (const ua of ["Mozilla/5.0 (compatible; Googlebot/2.1)", "facebookexternalhit/1.1", "WhatsApp/2.23", "Chrome-Lighthouse"]) {
      expect(run({ ua }).plays, ua).toBe(false);
    }
  });

  it("never plays with reduced motion, from the OS or the site's own switch", () => {
    expect(run({ reducedMotion: true }).plays).toBe(false);
    expect(run({ stopAnimations: true }).plays).toBe(false);
  });

  it("skips visitors from an ad or a social post, and marks the visit seen", () => {
    for (const search of ["?utm_source=tiktok&utm_medium=paid", "?fbclid=IwZX", "?ttclid=E.C.P", "?gclid=Cj0K", "?ref=1&utm_campaign=promote_oct"]) {
      const r = run({ search });
      expect(r.plays, search).toBe(false);
      expect(r.session["saylo-intro-seen"], search).toBe("1");
    }
    for (const referrer of ["https://www.tiktok.com/", "https://l.instagram.com/?u=x", "https://lm.facebook.com/l.php", "https://m.facebook.com/", "https://fb.me/abc"]) {
      expect(run({ referrer }).plays, referrer).toBe(false);
    }
    for (const ua of [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 musical_ly_36.0 BytedanceWebview/d8a21c6",
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36 trill_360 BytedanceWebview",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 350.0.0",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBAV/480.0]",
    ]) {
      expect(run({ ua }).plays, ua).toBe(false);
    }
  });

  it("still plays for other arrivals, look-alike hosts and unrelated query params", () => {
    expect(run({ referrer: "https://www.google.com/" }).plays).toBe(true);
    expect(run({ referrer: "https://nottiktok.com/" }).plays).toBe(true);
    expect(run({ referrer: "https://www.saylolearn.com/pricing" }).plays).toBe(true);
    expect(run({ search: "?plan=yearly" }).plays).toBe(true);
    expect(run({ search: "?xutm_source=1" }).plays).toBe(true);
  });

  it("?intro=1 previews it regardless of visit, page or reload", () => {
    expect(run({ search: "?intro=1", seen: true, reload: true, path: "/admin" }).plays).toBe(true);
    expect(run({ search: "?intro=1&utm_source=tiktok", referrer: "https://www.tiktok.com/" }).plays).toBe(true);
  });
});

// The logo waits for the screen to hold still (see settleWatcher). Driven
// frame by frame on a fake clock: `geometry(t)` is the window's height at
// time t, the way the iOS web view drops by the status bar just after launch.
function settleAt(geometry: (t: number) => number, { frameMs = 16, withRaf = true, until = 2000, app = false } = {}) {
  const attrs: Record<string, string> = {};
  let now = 0;
  let queued: ((t: number) => void) | null = null;
  const html = { setAttribute: (k: string, v: string) => (attrs[k] = v), clientWidth: 430, get clientHeight() { return geometry(now); } };
  const env = {
    document: { documentElement: html },
    location: { pathname: "/", search: "?intro=1" },
    navigator: { userAgent: "iPhone" },
    sessionStorage: { getItem: () => null, setItem: () => undefined },
    localStorage: { getItem: () => null },
    performance: { getEntriesByType: () => [{ type: "navigate" }], now: () => now },
    matchMedia: () => ({ matches: false }),
    window: app ? { Capacitor: { isNativePlatform: () => true }, screen: { height: 932 } } : {},
    screen: { height: 932 },
    innerWidth: 430,
    get innerHeight() { return geometry(now); },
    pageYOffset: 0,
    requestAnimationFrame: withRaf ? (cb: (t: number) => void) => { queued = cb; return 1; } : undefined,
  };
  // The page's globals, innerHeight read live through its getter; anything
  // else (JSON, Math, RegExp) falls through to the real ones.
  const scope = new Proxy(env, {
    has: (t, k) => k in t,
    get: (t, k) => (k === Symbol.unscopables ? undefined : (t as Record<string | symbol, unknown>)[k]),
  });
  new Function("scope", `with (scope) { ${appIntroScript} }`)(scope);
  while (!("data-intro-settled" in attrs) && now < until && queued) {
    const cb: (t: number) => void = queued;
    queued = null;
    now += frameMs;
    cb(now);
  }
  return "data-intro-settled" in attrs ? now : null;
}

describe("appIntroScript: the logo waits for a still screen", () => {
  it("starts soon when the screen is still from the first frame", () => {
    const t = settleAt(() => 932)!;
    expect(t).toBeGreaterThanOrEqual(150);
    expect(t).toBeLessThan(200);
  });

  it("in the app, waits out the status-bar drop, then holds 150ms past it", () => {
    // As in the owner's recording: about 50ms after launch the web view drops
    // (the window, full screen height until then, shrinks by the insets).
    const t = settleAt((now) => (now < 50 ? 932 : 873), { app: true })!;
    expect(t).toBeGreaterThanOrEqual(50 + 150);
    expect(t).toBeLessThan(50 + 150 + 32);
  });

  it("in the app, never more than half a second of empty plate", () => {
    // The owner's second recording: the drop wasn't visible to the page at
    // all, and a 1.2s cap left a long empty plate. Now 0.5s at most.
    const t = settleAt(() => 932, { app: true })!;
    expect(t).toBeGreaterThanOrEqual(500);
    expect(t).toBeLessThan(520);
  });

  it("in the app, even a late drop (0.4s) lands before the bubble shows", () => {
    // Released by the cap, the bubble still waits its own 0.26s beat.
    const t = settleAt((now) => (now < 400 ? 932 : 873), { app: true })!;
    expect(t).toBeLessThan(520);
    expect(t + 260).toBeGreaterThan(400);
  });

  it("never holds the logo past 0.9s, even on a screen that keeps moving", () => {
    const t = settleAt((now) => 900 + (Math.floor(now / 16) % 2))!;
    expect(t).toBeGreaterThanOrEqual(900);
    expect(t).toBeLessThan(940);
  });

  it("settles at once where there are no animation frames", () => {
    expect(settleAt(() => 932, { withRaf: false })).toBe(0);
  });
});
