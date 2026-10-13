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
} = {}) {
  const attrs: Record<string, string> = {};
  const session: Record<string, string> = seen ? { "saylo-intro-seen": "1" } : {};
  const local: Record<string, string> = stopAnimations ? { "saylo-a11y-prefs": JSON.stringify({ stopAnimations: true }) } : {};
  const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
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

  it("?intro=1 previews it regardless of visit, page or reload", () => {
    expect(run({ search: "?intro=1", seen: true, reload: true, path: "/admin" }).plays).toBe(true);
  });
});
