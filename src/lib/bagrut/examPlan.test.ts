import { describe, expect, it } from "vitest";
import {
  buildExamPlan,
  checkExamDate,
  daysLeftHe,
  examKindsFor,
  israelDate,
  weekStart,
  type ExamPlanInput,
} from "./examPlan";
import type { BagrutUnitProgress } from "@/types/database";

// 2026-11-18 is a Wednesday; its week starts Sunday 2026-11-15.
const TODAY = "2026-11-18";
const sets = [{ unitSlug: "1" }, { unitSlug: "2" }, { unitSlug: "3" }];

const row = (slug: string, best: number, completedAt: string): BagrutUnitProgress => ({
  profile_id: "p",
  module_code: "E",
  unit_slug: slug,
  mc_correct: 1,
  mc_total: 1,
  best_percent: best,
  attempts: 1,
  completed_at: completedAt,
});

const base: ExamPlanInput = {
  todayIso: TODAY,
  examDate: "2026-12-20",
  kind: "E",
  sets,
  progress: [],
  oralGradesThisWeek: 0,
  conversationsThisWeek: 0,
};

describe("dates", () => {
  it("uses Israel's calendar day, not UTC", () => {
    // 23:30 UTC on the 14th is already the 15th in Israel.
    expect(israelDate(new Date("2026-11-14T23:30:00Z"))).toBe("2026-11-15");
  });

  it("starts weeks on Sunday", () => {
    expect(weekStart("2026-11-18")).toBe("2026-11-15");
    expect(weekStart("2026-11-15")).toBe("2026-11-15");
    expect(weekStart("2026-11-21")).toBe("2026-11-15");
  });

  it("accepts only a real date from today to 400 days ahead", () => {
    expect(checkExamDate("2026-12-20", TODAY)).toBe("ok");
    expect(checkExamDate(TODAY, TODAY)).toBe("ok");
    expect(checkExamDate("2026-11-17", TODAY)).toBe("past");
    expect(checkExamDate("2028-01-01", TODAY)).toBe("too-far");
    expect(checkExamDate("2026-02-30", TODAY)).toBe("invalid");
    expect(checkExamDate("next week", TODAY)).toBe("invalid");
  });

  it("says one day in words", () => {
    expect(daysLeftHe(1)).toBe("עוד יום אחד");
    expect(daysLeftHe(23)).toBe("עוד 23 ימים");
  });
});

describe("examKindsFor", () => {
  it("offers the track's questionnaires, and the oral exam only for 4 and 5 points", () => {
    expect(examKindsFor(3)).toEqual(["A", "B", "C"]);
    expect(examKindsFor(5)).toEqual(["E", "F", "G", "oral"]);
    expect(examKindsFor(null)).toContain("oral");
  });
});

describe("buildExamPlan", () => {
  it("counts down and suggests the sets not done yet", () => {
    const plan = buildExamPlan(base);
    expect(plan).toMatchObject({ status: "upcoming", daysLeft: 32, weeksLeft: 5, finalWeek: false });
    if (plan.status !== "upcoming") throw new Error();
    expect(plan.tasks.map((t) => [t.key, t.done])).toEqual([
      ["1", false],
      ["2", false],
    ]);
    expect(plan.tasks[0].href).toBe("/bagrut/E/1");
  });

  it("ticks a set done this week, and skips sets done earlier for weak or untouched ones", () => {
    const plan = buildExamPlan({
      ...base,
      progress: [
        row("1", 90, "2026-11-16T10:00:00Z"), // this week
        row("2", 95, "2026-11-10T10:00:00Z"), // last week, strong
        row("3", 60, "2026-11-11T10:00:00Z"), // last week, weak
      ],
    });
    if (plan.status !== "upcoming") throw new Error();
    expect(plan.tasks.map((t) => [t.key, t.done])).toEqual([
      ["1", true],
      ["3", false],
    ]);
    expect(plan.tasks[1].labelHe).toContain("לחזור על ערכה 3");
    expect(plan.tasks[1].labelHe).toContain("60%");
  });

  it("counts a set done on Saturday night Israel time in the right week", () => {
    // 22:30 UTC Saturday 14.11 = 00:30 Sunday 15.11 in Israel: this week.
    const plan = buildExamPlan({ ...base, progress: [row("1", 90, "2026-11-14T22:30:00Z")] });
    if (plan.status !== "upcoming") throw new Error();
    expect(plan.tasks[0]).toMatchObject({ key: "1", done: true });
  });

  it("when everything is strong, repeats the oldest sets with the exam timer", () => {
    const plan = buildExamPlan({
      ...base,
      progress: [row("1", 90, "2026-11-03T10:00:00Z"), row("2", 85, "2026-11-01T10:00:00Z"), row("3", 100, "2026-11-05T10:00:00Z")],
    });
    if (plan.status !== "upcoming") throw new Error();
    expect(plan.tasks.map((t) => t.key)).toEqual(["2", "1"]);
    expect(plan.tasks[0].labelHe).toContain("עם השעון של הבחינה");
  });

  it("an exam on next Sunday makes this the last practice week", () => {
    expect(buildExamPlan({ ...base, examDate: "2026-11-22" })).toMatchObject({ weeksLeft: 1, finalWeek: true });
  });

  it("in the exam's own week asks for the exam timer", () => {
    const plan = buildExamPlan({ ...base, examDate: "2026-11-20" });
    expect(plan).toMatchObject({ status: "upcoming", daysLeft: 2, weeksLeft: 1, finalWeek: true });
    if (plan.status !== "upcoming") throw new Error();
    expect(plan.tasks[0].labelHe).toContain("עם השעון של הבחינה");
  });

  it("for the oral exam: one simulation and one teacher conversation a week", () => {
    const plan = buildExamPlan({ ...base, kind: "oral", oralGradesThisWeek: 4, conversationsThisWeek: 0 });
    if (plan.status !== "upcoming") throw new Error();
    expect(plan.tasks.map((t) => [t.href, t.done])).toEqual([
      ["/bagrut/oral", true],
      ["/speaking", false],
    ]);
    const partial = buildExamPlan({ ...base, kind: "oral", oralGradesThisWeek: 3 });
    if (partial.status !== "upcoming") throw new Error();
    expect(partial.tasks[0].done).toBe(false);
  });

  it("knows exam day and a date that has passed", () => {
    expect(buildExamPlan({ ...base, examDate: TODAY })).toEqual({ status: "today" });
    expect(buildExamPlan({ ...base, examDate: "2026-11-10" })).toEqual({ status: "past", daysAgo: 8 });
  });

  it("ignores progress of other questionnaires", () => {
    const plan = buildExamPlan({ ...base, progress: [{ ...row("1", 90, "2026-11-16T10:00:00Z"), module_code: "F" }] });
    if (plan.status !== "upcoming") throw new Error();
    expect(plan.tasks.every((t) => !t.done)).toBe(true);
  });
});
