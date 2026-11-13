import { describe, expect, it } from "vitest";
import { buildFunnel } from "./funnel";

describe("buildFunnel", () => {
  it("counts each step by distinct real learners only", () => {
    const steps = buildFunnel({
      realProfileIds: new Set(["a", "b", "c"]),
      incompleteSignups: 2,
      // "a" took the test twice, "t" is a test account.
      completedPlacementProfileIds: ["a", "a", "b", "t", "t"],
      attemptProfileIds: ["a", "a", "a", "t"],
      conversationProfileIds: ["t"],
    });
    expect(steps.map((s) => s.count)).toEqual([5, 3, 2, 1, 0]);
  });

  it("never lets a later step exceed the profiles step", () => {
    const steps = buildFunnel({
      realProfileIds: new Set(["a"]),
      incompleteSignups: 0,
      completedPlacementProfileIds: ["a", "a", "x", "y", "z"],
      attemptProfileIds: ["a", "x"],
      conversationProfileIds: ["a", "y"],
    });
    for (const s of steps.slice(2)) expect(s.count).toBeLessThanOrEqual(steps[1].count);
  });
});
