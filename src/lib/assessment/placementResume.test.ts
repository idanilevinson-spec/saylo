import { describe, expect, it } from "vitest";
import { placementResumePoint } from "./placementResume";

const ids = Array.from({ length: 36 }, (_, i) => `q${i}`);

describe("placementResumePoint", () => {
  it("continues after the last answered question", () => {
    expect(placementResumePoint(ids, ids.slice(0, 20))).toEqual({ answered: 20, nextIndex: 20 });
  });

  it("all answered: straight to the last step", () => {
    expect(placementResumePoint(ids, ids)).toEqual({ answered: 36, nextIndex: 36 });
  });

  it("a question skipped along the way stays skipped", () => {
    const answered = ids.slice(0, 10).filter((id) => id !== "q4");
    expect(placementResumePoint(ids, answered)).toEqual({ answered: 9, nextIndex: 10 });
  });

  it("nothing answered, or only questions no longer on the test: nothing to resume", () => {
    expect(placementResumePoint(ids, [])).toBeNull();
    expect(placementResumePoint(ids, ["retired-question"])).toBeNull();
  });
});
