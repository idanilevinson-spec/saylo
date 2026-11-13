import { describe, expect, it } from "vitest";
import { markChanges, pickSimulation } from "./oralPick";

describe("pickSimulation", () => {
  it("offers two different Part A topics, at any random value", () => {
    for (const r of [0, 0.3, 0.5, 0.999999]) {
      const sim = pickSimulation(() => r);
      expect(sim.partA[0].id).not.toBe(sim.partA[1].id);
      expect(sim.partB.questions).toHaveLength(2);
      expect(sim.partC.sets).toHaveLength(2);
    }
  });
});

describe("markChanges", () => {
  it("marks only the new or fixed words", () => {
    const marks = markChanges("I am agree with him", "I agree with him, because bees matter.");
    expect(marks.filter((m) => m.changed).map((m) => m.word)).toEqual(["because", "bees", "matter."]);
    expect(marks.map((m) => m.word).join(" ")).toBe("I agree with him, because bees matter.");
  });

  it("matches across case and punctuation", () => {
    expect(markChanges("so my project", "So, my project").every((m) => !m.changed)).toBe(true);
  });

  it("handles empty input", () => {
    expect(markChanges("", "Hello there")).toEqual([
      { word: "Hello", changed: true },
      { word: "there", changed: true },
    ]);
    expect(markChanges("words", "")).toEqual([]);
  });
});
