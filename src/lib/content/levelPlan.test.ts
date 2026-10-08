import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/browserClient", () => ({ supabase: {} }));

import { overallLevel, pickForKind, type PlanCandidate } from "./levelPlan";

const c = (id: string, level: PlanCandidate["level"]): PlanCandidate => ({
  id,
  titleHe: id,
  titleEn: id,
  level,
  href: `/x/${id}`,
  minutes: 5,
});
const pool = [c("a1", "A1"), c("b1-first", "B1"), c("b1-second", "B1"), c("b2", "B2")];
const TODAY = new Date("2026-10-09T00:00:00").getTime();

describe("pickForKind", () => {
  it("picks the first untouched item at the learner's level", () => {
    const item = pickForKind("grammar", pool, "B1", new Map(), TODAY);
    expect(item?.id).toBe("b1-first");
    expect(item?.doneToday).toBe(false);
    expect(item?.fallbackFrom).toBeNull();
  });

  it("keeps today's item once it was practiced today, marked done", () => {
    const touched = new Map([["b1-second", TODAY + 3600_000]]);
    const item = pickForKind("grammar", pool, "B1", touched, TODAY);
    expect(item?.id).toBe("b1-second");
    expect(item?.doneToday).toBe(true);
  });

  it("skips items done on earlier days", () => {
    const touched = new Map([["b1-first", TODAY - 86_400_000]]);
    expect(pickForKind("grammar", pool, "B1", touched, TODAY)?.id).toBe("b1-second");
  });

  it("when everything at the level was done, picks the least recently touched", () => {
    const touched = new Map([
      ["b1-first", TODAY - 2 * 86_400_000],
      ["b1-second", TODAY - 5 * 86_400_000],
    ]);
    expect(pickForKind("grammar", pool, "B1", touched, TODAY)?.id).toBe("b1-second");
  });

  it("falls back to the nearest level with content and says so", () => {
    const item = pickForKind("writing", [c("a2", "A2"), c("c1", "C1")], "B2", new Map(), TODAY);
    expect(item?.id).toBe("c1");
    expect(item?.fallbackFrom).toBe("B2");
  });
});

describe("overallLevel", () => {
  it("is null before a placement test", () => {
    expect(overallLevel(null, { reading: "B1", grammar: "B1", vocabulary: "B1" })).toBeNull();
  });
  it("uses the placement result while few skills have a live level", () => {
    expect(overallLevel("A2", { reading: "C1" })).toBe("A2");
  });
  it("uses the (lower) median of live skill levels once three or more exist", () => {
    expect(overallLevel("A1", { vocabulary: "C1", grammar: "A1", reading: "C1", listening: "A1", speaking: "B1" })).toBe("B1");
    expect(overallLevel("A1", { vocabulary: "C1", grammar: "A1", reading: "C1", listening: "A1" })).toBe("A1");
  });
});
