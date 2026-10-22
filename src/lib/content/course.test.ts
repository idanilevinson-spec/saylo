import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/browserClient", () => ({ supabase: {} }));

import { COURSE_LEVELS, COURSE_UNITS, findUnit, unitNumber, unitsForLevel } from "./course";
import { pickCheckQuestions, pickCurrent, questionsStatus, summarizeUnit, topicStatus, type ResolvedStep } from "./courseProgress";

// Whether each key matches real content is checked against the database
// by scripts/course-audit.mjs; these hold the shape of the map itself.
describe("course map", () => {
  it("covers every level", () => {
    for (const level of COURSE_LEVELS) expect(unitsForLevel(level).length).toBeGreaterThanOrEqual(8);
  });

  it("gives every unit a unique id, a title and a goal", () => {
    const ids = COURSE_UNITS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const unit of COURSE_UNITS) {
      expect(unit.titleHe.trim()).not.toBe("");
      expect(unit.goalHe.trim()).not.toBe("");
    }
  });

  it("gives every unit something to check at the end (vocabulary or grammar)", () => {
    const without = COURSE_UNITS.filter((u) => !u.steps.some((s) => s.kind === "vocabulary" || s.kind === "grammar"));
    expect(without.map((u) => u.id)).toEqual([]);
  });

  it("keeps units short and never repeats a step inside one", () => {
    for (const unit of COURSE_UNITS) {
      expect(unit.steps.length).toBeGreaterThanOrEqual(3);
      expect(unit.steps.length).toBeLessThanOrEqual(7);
      const keys = unit.steps.map((s) => `${s.kind}:${s.ref}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("uses each grammar topic in one unit only", () => {
    const grammar = COURSE_UNITS.flatMap((u) => u.steps.filter((s) => s.kind === "grammar").map((s) => s.ref));
    expect(new Set(grammar).size).toBe(grammar.length);
  });

  it("numbers units within their level", () => {
    const unit = findUnit("b1-3")!;
    expect(unit.level).toBe("B1");
    expect(unitNumber(unit)).toBe(3);
    expect(findUnit("z9-1")).toBeNull();
  });
});

describe("course progress", () => {
  const step = (status: ResolvedStep["status"]): ResolvedStep => ({
    kind: "grammar",
    ref: "x",
    contentId: "id",
    titleHe: "",
    titleEn: null,
    href: "/",
    minutes: 5,
    status,
  });

  it("counts a topic as learned at 80% over three answers", () => {
    expect(topicStatus(0, 0)).toBe("todo");
    expect(topicStatus(2, 2)).toBe("started");
    expect(topicStatus(3, 4)).toBe("started");
    expect(topicStatus(4, 5)).toBe("done");
  });

  it("counts a text as done once every question has an answer", () => {
    expect(questionsStatus(0, 5)).toBe("todo");
    expect(questionsStatus(4, 5)).toBe("started");
    expect(questionsStatus(5, 5)).toBe("done");
  });

  it("finishes a unit only with its check passed", () => {
    const unit = findUnit("a1-1")!;
    const allDone = summarizeUnit(unit, [step("done"), step("done")], false);
    expect(allDone.status).toBe("started");
    expect(allDone.done).toBe(2);
    expect(allDone.total).toBe(3);
    expect(summarizeUnit(unit, [step("todo")], false).status).toBe("todo");
    expect(summarizeUnit(unit, [step("todo")], true).status).toBe("done");
  });

  it("continues from the learner's level, skipping finished units", () => {
    const units = ["a1-1", "a2-1", "a2-2", "b1-1"].map((id) => summarizeUnit(findUnit(id)!, [], id === "a2-1"));
    expect(pickCurrent(units, "A2")?.unit.id).toBe("a2-2");
    expect(pickCurrent(units, null)?.unit.id).toBe("a1-1");
    expect(pickCurrent(units.slice(1, 2), "A2")).toBeNull();
  });

  it("mixes vocabulary and grammar in the check, filling from either side", () => {
    const vocab = Array.from({ length: 20 }, (_, i) => `v${i}`);
    const grammar = Array.from({ length: 20 }, (_, i) => `g${i}`);
    const even = pickCheckQuestions(vocab, grammar, 10);
    expect(even).toHaveLength(10);
    expect(even.filter((q) => q.startsWith("g"))).toHaveLength(5);
    expect(pickCheckQuestions(vocab.slice(0, 2), grammar, 10).filter((q) => q.startsWith("g"))).toHaveLength(8);
    expect(pickCheckQuestions([], grammar.slice(0, 4), 10)).toHaveLength(4);
  });
});
