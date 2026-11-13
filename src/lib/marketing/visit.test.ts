import { describe, expect, it } from "vitest";
import {
  buildVisitPayload,
  deviceFromUserAgent,
  DUPLICATE_WINDOW_MS,
  isBot,
  seenRecently,
  socialHost,
  visitKey,
} from "./visit";

describe("duplicate arrivals", () => {
  const fb = { path: "/try", referrerHost: "m.facebook.com" };

  it("counts the same arrival sent three times together once", () => {
    const seen = new Map<string, number>();
    const key = visitKey(fb, "mobile");
    expect([0, 46, 143].map((ms) => seenRecently(seen, key, 1_000 + ms))).toEqual([false, true, true]);
  });

  it("still counts a different link, page or device, and the same one after the window", () => {
    const seen = new Map<string, number>();
    seenRecently(seen, visitKey(fb, "mobile"), 0);
    expect(seenRecently(seen, visitKey(fb, "desktop"), 10)).toBe(false);
    expect(seenRecently(seen, visitKey({ ...fb, path: "/" }, "mobile"), 10)).toBe(false);
    expect(seenRecently(seen, visitKey({ ...fb, utm_content: "ep-2" }, "mobile"), 10)).toBe(false);
    expect(seenRecently(seen, visitKey(fb, "mobile"), DUPLICATE_WINDOW_MS + 1)).toBe(false);
  });

  it("forgets old keys so the map stays small", () => {
    const seen = new Map<string, number>();
    for (let i = 0; i < 50; i++) seenRecently(seen, `k${i}`, 0);
    seenRecently(seen, "new", DUPLICATE_WINDOW_MS + 1);
    expect(seen.size).toBe(1);
  });
});

describe("buildVisitPayload", () => {
  it("keeps only utm tags, lowercased, and the path", () => {
    const p = buildVisitPayload(
      "https://saylolearn.com/try?utm_source=Instagram&utm_medium=social&utm_content=departures-2&email=a@b.c",
      null
    );
    expect(p).toEqual({
      utm_source: "instagram",
      utm_medium: "social",
      utm_content: "departures-2",
      path: "/try",
      referrerHost: null,
    });
  });

  it("counts a social-app arrival without tags", () => {
    expect(buildVisitPayload("https://saylolearn.com/", "https://l.instagram.com/?u=x")).toEqual({
      path: "/",
      referrerHost: "l.instagram.com",
    });
  });

  it("sends nothing for an ordinary visit", () => {
    expect(buildVisitPayload("https://saylolearn.com/try", "https://www.google.com/")).toBeNull();
    expect(buildVisitPayload("https://saylolearn.com/try", null)).toBeNull();
  });

  it("never counts admin pages", () => {
    expect(buildVisitPayload("https://saylolearn.com/admin?utm_source=x", null)).toBeNull();
  });
});

describe("socialHost", () => {
  it("matches subdomains but not look-alikes", () => {
    expect(socialHost("https://www.tiktok.com/@x")).toBe("tiktok.com");
    expect(socialHost("https://m.facebook.com/")).toBe("m.facebook.com");
    expect(socialHost("https://notinstagram.com/")).toBeNull();
    expect(socialHost("not a url")).toBeNull();
  });
});

describe("device and bots", () => {
  it("reads the device type", () => {
    expect(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Instagram 350")).toBe("mobile");
    expect(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)")).toBe("tablet");
    expect(deviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140")).toBe("desktop");
  });

  it("drops link previews and missing user agents", () => {
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot("Mozilla/5.0 (iPhone) Instagram 350")).toBe(false);
  });
});
