import { describe, it, expect } from "vitest";
import { israelWeekStart, israelMonthStart, isLastDayOfIsraelMonth } from "./buildScoreSummary";

function israelParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), weekday: get("weekday") };
}

// A handful of instants spanning both sides of Israel's DST transitions
// (spring-forward late March, fall-back late October) — the offset-lookup
// trick in israelOffsetMinutes is exactly the kind of thing that silently
// breaks across a DST boundary if it's wrong.
const SAMPLE_INSTANTS = [
  new Date("2026-01-04T05:00:00Z"),
  new Date("2026-03-11T10:00:00Z"),
  new Date("2026-03-27T23:30:00Z"),
  new Date("2026-06-15T18:00:00Z"),
  new Date("2026-10-24T02:00:00Z"),
  new Date("2026-12-31T21:00:00Z"),
];

describe("israelWeekStart", () => {
  it.each(SAMPLE_INSTANTS)("resolves to Israel-local Sunday midnight for %s", (now) => {
    const start = israelWeekStart(now);
    const parts = israelParts(start);
    expect(parts.weekday).toBe("Sun");
    expect(parts.hour).toBe("00");
    expect(parts.minute).toBe("00");
    expect(start.getTime()).toBeLessThanOrEqual(now.getTime());
    // Never more than 7 days back, plus a generous DST-shift buffer.
    expect(now.getTime() - start.getTime()).toBeLessThan(8 * 24 * 60 * 60 * 1000);
  });
});

describe("isLastDayOfIsraelMonth", () => {
  it("is true on the last day of a 31-day month", () => {
    expect(isLastDayOfIsraelMonth(new Date("2026-01-31T08:00:00Z"))).toBe(true);
  });

  it("is false mid-month", () => {
    expect(isLastDayOfIsraelMonth(new Date("2026-01-15T08:00:00Z"))).toBe(false);
  });

  it("handles a leap-year February correctly", () => {
    expect(isLastDayOfIsraelMonth(new Date("2028-02-28T08:00:00Z"))).toBe(false);
    expect(isLastDayOfIsraelMonth(new Date("2028-02-29T08:00:00Z"))).toBe(true);
  });

  it("is true on the last day of a 30-day month", () => {
    expect(isLastDayOfIsraelMonth(new Date("2026-04-30T08:00:00Z"))).toBe(true);
  });
});

describe("israelMonthStart", () => {
  it.each(SAMPLE_INSTANTS)("resolves to Israel-local day 1 midnight for %s", (now) => {
    const start = israelMonthStart(now);
    const parts = israelParts(start);
    const nowParts = israelParts(now);
    expect(parts.day).toBe("01");
    expect(parts.hour).toBe("00");
    expect(parts.minute).toBe("00");
    expect(parts.year).toBe(nowParts.year);
    expect(parts.month).toBe(nowParts.month);
    expect(start.getTime()).toBeLessThanOrEqual(now.getTime());
  });
});
