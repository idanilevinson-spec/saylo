import { describe, expect, it } from "vitest";
import { showFirstStepsOnly } from "./firstSteps";

describe("showFirstStepsOnly", () => {
  it("is on for a placed learner with no XP yet", () => {
    expect(showFirstStepsOnly(0, true)).toBe(true);
  });

  it("is off from the first XP", () => {
    expect(showFirstStepsOnly(5, true)).toBe(false);
  });

  it("is off before placement and while loading", () => {
    expect(showFirstStepsOnly(0, false)).toBe(false);
    expect(showFirstStepsOnly(null, true)).toBe(false);
  });
});
