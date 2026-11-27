import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { APP_PREFIXES, arrivalSource, cleanDetail, isAppPath, isFunnelStep, loginNextPath } from "./funnel";
import { summarizeSiteFunnel, type SiteFunnelRow } from "@/lib/admin/siteFunnel";

describe("arrivalSource", () => {
  const own = "www.saylolearn.com";

  it("prefers the link's utm_source", () => {
    expect(arrivalSource("Instagram", "https://l.instagram.com/", own)).toBe("instagram");
  });

  it("names search engines and AI answers, keeps other sites by name only", () => {
    expect(arrivalSource(null, "https://www.google.co.il/", own)).toBe("google");
    expect(arrivalSource(null, "https://chatgpt.com/c/123", own)).toBe("chatgpt");
    expect(arrivalSource(null, "https://l.instagram.com/?u=https%3A%2F%2Fx", own)).toBe("l.instagram.com");
  });

  it("calls no referrer, our own site and junk 'direct'", () => {
    expect(arrivalSource(null, null, own)).toBe("direct");
    expect(arrivalSource(null, "https://saylolearn.com/pricing", own)).toBe("direct");
    expect(arrivalSource(null, "not a url", own)).toBe("direct");
  });
});

describe("paths", () => {
  it("tells app pages from public ones without matching look-alikes", () => {
    expect(isAppPath("/dashboard")).toBe(true);
    expect(isAppPath("/grammar/present-simple")).toBe(true);
    expect(isAppPath("/try")).toBe(false);
    expect(isAppPath("/english-bagrut")).toBe(false);
    expect(isAppPath("/bagrut-tips")).toBe(false);
  });

  it("covers every page the sign-in gate protects", () => {
    const proxy = readFileSync(join(process.cwd(), "src/proxy.ts"), "utf8");
    const matched = [...proxy.matchAll(/"(\/[a-z-]+)\/:path\*"/g)].map((m) => m[1]);
    expect(matched.length).toBeGreaterThan(10);
    for (const prefix of matched) expect(APP_PREFIXES).toContain(prefix);
  });

  it("keeps only a site path from a sign-in redirect", () => {
    expect(loginNextPath("?next=%2Fbagrut%2Fwriting%3Fa%3D1")).toBe("/bagrut/writing");
    expect(loginNextPath("?next=//evil.com")).toBeNull();
    expect(loginNextPath("?next=https://evil.com")).toBeNull();
    expect(loginNextPath("")).toBeNull();
  });
});

describe("step and detail checks", () => {
  it("accepts only known steps", () => {
    expect(isFunnelStep("try_start")).toBe(true);
    expect(isFunnelStep("purchase")).toBe(false);
  });

  it("drops anything that isn't a short label or path", () => {
    expect(cleanDetail("google")).toBe("google");
    expect(cleanDetail("/login?next=/dashboard")).toBe("/login?next=/dashboard");
    expect(cleanDetail("someone@mail.com")).toBeNull();
    expect(cleanDetail("שם")).toBeNull();
    expect(cleanDetail(42)).toBeNull();
  });
});

describe("summarizeSiteFunnel", () => {
  const row = (step: SiteFunnelRow["step"], source = "instagram", detail: string | null = null): SiteFunnelRow => ({
    step,
    source,
    detail,
    device: "mobile",
  });

  it("counts each step and splits by source, method and landing page", () => {
    const s = summarizeSiteFunnel([
      row("visit", "instagram", "/try"),
      row("visit", "instagram", "/try"),
      row("visit", "google", "/"),
      row("try_start"),
      row("signup_view", "google"),
      row("signup_submit", "google", "google"),
      row("signup_error", "google", "other"),
    ]);
    expect(s.steps[0]).toEqual({ step: "visit", label: "נכנסו לאתר", count: 3 });
    expect(s.steps.find((x) => x.step === "try_start")?.count).toBe(1);
    expect(s.sources).toEqual([
      { source: "instagram", visits: 2, trialStarts: 1, signupViews: 0 },
      { source: "google", visits: 1, trialStarts: 0, signupViews: 1 },
    ]);
    expect(s.topLandings).toEqual([
      { path: "/try", count: 2 },
      { path: "/", count: 1 },
    ]);
    expect(s.signupMethods).toEqual([{ method: "google", count: 1 }]);
    expect(s.signupErrors).toEqual([{ reason: "other", count: 1 }]);
  });
});
