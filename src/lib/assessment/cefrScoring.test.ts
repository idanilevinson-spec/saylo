import { describe, it, expect } from "vitest";
import { cefrLevelFromPercent } from "./cefrScoring";

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
