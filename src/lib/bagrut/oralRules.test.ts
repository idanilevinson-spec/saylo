import { describe, expect, it } from "vitest";
import {
  CRITERIA,
  examGrade,
  formatSeconds,
  PART_POINTS,
  partBLengthDeduction,
  recordingsDeduction,
  setGrade,
} from "./oralRules";

describe("official numbers", () => {
  it("parts add up to 100 and the rubric weights to 100", () => {
    expect(PART_POINTS.A + PART_POINTS.B + PART_POINTS.C).toBe(100);
    expect(CRITERIA.reduce((s, c) => s + c.weight, 0)).toBe(100);
  });

  it("Part B length table, edges included", () => {
    expect([120, 60, 59, 50, 49, 40, 39, 16, 15, 0].map(partBLengthDeduction)).toEqual([
      0, 0, 0.05, 0.05, 0.1, 0.1, 0.2, 0.2, 1, 1,
    ]);
  });

  it("recordings table", () => {
    expect([1, 2, 3, 5, 6, 8, 9].map(recordingsDeduction)).toEqual([0, 0, 0.5, 0.5, 0.75, 0.75, 1]);
  });
});

const all = (n: number) => CRITERIA.map((c) => ({ key: c.key, score: n }));

describe("setGrade", () => {
  it("weights the criteria", () => {
    expect(setGrade(all(100), { part: "A", seconds: 30, recordings: 1 })).toBe(100);
    expect(
      setGrade(
        [
          { key: "topic", score: 50 },
          { key: "delivery", score: 100 },
          { key: "vocabulary", score: 100 },
          { key: "language", score: 100 },
        ],
        { part: "A", seconds: 30, recordings: 1 },
      ),
    ).toBe(70);
  });

  it("a short Part B answer loses only from Topic Development", () => {
    // 45 seconds: 10% off the topic's 60 → 54 + 40 = 94.
    expect(setGrade(all(100), { part: "B", seconds: 45, recordings: 1 })).toBe(94);
    // Length doesn't count outside Part B.
    expect(setGrade(all(100), { part: "C", seconds: 10, recordings: 1 })).toBe(100);
  });

  it("too many recordings cut the whole set", () => {
    expect(setGrade(all(100), { part: "A", seconds: 30, recordings: 4 })).toBe(50);
  });

  it("ignores junk scores", () => {
    expect(setGrade([{ key: "topic", score: Number.NaN }], { part: "A", seconds: 0, recordings: 1 })).toBe(0);
    expect(setGrade(all(140), { part: "A", seconds: 0, recordings: 1 })).toBe(100);
  });
});

describe("examGrade", () => {
  it("A and B are 25 each, C's two sets share 50", () => {
    expect(
      examGrade([
        { part: "A", grade: 80 },
        { part: "B", grade: 60 },
        { part: "C", grade: 100 },
        { part: "C", grade: 50 },
      ]),
    ).toBe(Math.round(20 + 15 + 37.5));
  });

  it("a missing C set counts as zero, not as the other set", () => {
    expect(examGrade([{ part: "C", grade: 100 }])).toBe(25);
  });
});

it("formats seconds", () => {
  expect([0, 9, 60, 125].map(formatSeconds)).toEqual(["0:00", "0:09", "1:00", "2:05"]);
});

it("isolates the part letter inside Hebrew", async () => {
  const { partName } = await import("./oralRules");
  expect(partName("A")).toBe("חלק ⁨A⁩");
});
