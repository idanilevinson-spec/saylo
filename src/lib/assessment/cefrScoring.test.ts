import { describe, it, expect } from "vitest";
import { cefrLevelFromPercent, placementLevelFromPercent } from "./cefrScoring";

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
