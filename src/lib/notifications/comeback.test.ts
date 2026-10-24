import { describe, expect, it } from "vitest";
import { pickComeback, type ComebackInput } from "./comeback";

const now = new Date("2026-10-24T16:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

const base: ComebackInput = {
  now,
  hasActiveStreak: false,
  lastComebackAt: null,
  lastActiveAt: daysAgo(2),
  placementCompletedAt: null,
  placedLevel: null,
  openPlacement: { answered: 19, total: 36, startedAt: daysAgo(2) },
  practisedSincePlacement: false,
};

describe("pickComeback", () => {
  it("invites back to a placement test left half done, with the real count", () => {
    const c = pickComeback(base)!;
    expect(c.kind).toBe("finish_placement");
    expect(c.heading).toContain("19 מתוך 36");
    expect(c.href).toBe("https://saylolearn.com/placement");
  });

  it("leaves a test with no answers, or one past the resume window, alone", () => {
    expect(pickComeback({ ...base, openPlacement: { answered: 0, total: 36, startedAt: daysAgo(2) } })).toBeNull();
    expect(pickComeback({ ...base, openPlacement: { answered: 19, total: 36, startedAt: daysAgo(8) } })).toBeNull();
    expect(pickComeback({ ...base, openPlacement: null })).toBeNull();
  });

  it("points a finished placement with no learning after it at unit 1 of the placed level", () => {
    const c = pickComeback({ ...base, placementCompletedAt: daysAgo(2), placedLevel: "A2", openPlacement: null })!;
    expect(c.kind).toBe("start_course");
    expect(c.href).toBe("https://saylolearn.com/course/a2-1");
    expect(c.heading).toContain("יחידה 1");
  });

  it("nudges after a few quiet days once learning started, not before", () => {
    const started = { ...base, placementCompletedAt: daysAgo(10), placedLevel: "B1" as const, openPlacement: null, practisedSincePlacement: true };
    expect(pickComeback({ ...started, lastActiveAt: daysAgo(2) })).toBeNull();
    expect(pickComeback({ ...started, lastActiveAt: daysAgo(4) })?.kind).toBe("inactive");
  });

  it("never writes to someone active today, on a streak, recently written to, or long gone", () => {
    expect(pickComeback({ ...base, lastActiveAt: daysAgo(0.3) })).toBeNull();
    expect(pickComeback({ ...base, hasActiveStreak: true })).toBeNull();
    expect(pickComeback({ ...base, lastComebackAt: daysAgo(4) })).toBeNull();
    expect(pickComeback({ ...base, lastComebackAt: daysAgo(6) })?.kind).toBe("finish_placement");
    expect(
      pickComeback({ ...base, placementCompletedAt: daysAgo(60), practisedSincePlacement: true, openPlacement: null, lastActiveAt: daysAgo(40) }),
    ).toBeNull();
  });

  it("keeps every message free of the long dash (copy rule)", () => {
    const all = [
      pickComeback(base)!,
      pickComeback({ ...base, placementCompletedAt: daysAgo(2), placedLevel: "C1", openPlacement: null })!,
      pickComeback({ ...base, placementCompletedAt: daysAgo(9), openPlacement: null, practisedSincePlacement: true, lastActiveAt: daysAgo(5) })!,
    ];
    for (const c of all) expect(Object.values(c).join(" ")).not.toContain("—");
  });
});
