import { describe, it, expect } from "vitest";
import { cefrLevelFromPercent, placementLevelFromPercent, placementScore } from "./cefrScoring";

describe("cefrLevelFromPercent", () => {
  it.each([
    [0, "A1"],
    [34, "A1"],
    [35, "A2"],
    [49, "A2"],
    [50, "B1"],
    [64, "B1"],
    [65, "B2"],
    [79, "B2"],
    [80, "C1"],
    [91, "C1"],
    [92, "C2"],
    [100, "C2"],
  ] as const)("maps %i%% correct to %s", (percent, expected) => {
    expect(cefrLevelFromPercent(percent)).toBe(expected);
  });
});

describe("placementLevelFromPercent", () => {
  // Expected score with six questions per level: knows up to level k,
  // guesses the rest with four options.
  const expected = (k: number) => Math.round(((k + 0.25 * (6 - k)) / 6) * 100);

  it.each([
    [1, "A1"],
    [2, "A2"],
    [3, "B1"],
    [4, "B2"],
    [5, "C1"],
    [6, "C2"],
  ] as const)("someone who knows %i level(s) and guesses the rest comes out %s", (k, level) => {
    expect(placementLevelFromPercent(expected(k))).toBe(level);
  });

  it("gives C2 with up to two slips out of 36, not three", () => {
    expect(placementLevelFromPercent(Math.round((34 / 36) * 100))).toBe("C2");
    expect(placementLevelFromPercent(Math.round((33 / 36) * 100))).toBe("C1");
  });

  it("puts pure guessing at A1", () => {
    expect(placementLevelFromPercent(25)).toBe("A1");
  });
});

describe("placementScore: skipping is not a shortcut", () => {
  it("someone who knows up to B2 and skips the twelve C questions comes out B2, not C2", () => {
    expect(placementScore({ correct: 24, answered: 24, questions: 36 }).level).toBe("B2");
  });

  it("someone who knows up to B1 and skips everything above comes out B1, not C2", () => {
    expect(placementScore({ correct: 18, answered: 18, questions: 36 }).level).toBe("B1");
  });

  it("skipping lands where guessing would have, on average", () => {
    // Knows up to B2: guessing the 12 C questions gets about 3 right.
    const guessed = placementScore({ correct: 27, answered: 36, questions: 36 }).level;
    const skipped = placementScore({ correct: 24, answered: 24, questions: 36 }).level;
    expect(skipped).toBe(guessed);
  });

  it("answering everything is scored as before", () => {
    expect(placementScore({ correct: 36, answered: 36, questions: 36 })).toEqual({ percentCorrect: 100, level: "C2" });
    expect(placementScore({ correct: 9, answered: 36, questions: 36 }).level).toBe("A1");
  });

  it("shows right answers out of every question in the test", () => {
    expect(placementScore({ correct: 24, answered: 24, questions: 36 }).percentCorrect).toBe(67);
  });

  it("per skill too: reading, one question per level, skips counted the same way", () => {
    expect(placementScore({ correct: 4, answered: 4, questions: 6 }).level).toBe("B2");
  });

  it("never divides by nothing", () => {
    expect(placementScore({ correct: 0, answered: 0, questions: 0 })).toEqual({ percentCorrect: 0, level: "A1" });
  });
});
