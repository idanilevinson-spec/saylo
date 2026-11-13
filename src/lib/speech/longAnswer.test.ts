import { describe, expect, it } from "vitest";
import { elapsedSeconds, joinSegments, wordCount } from "./longAnswer";

describe("joinSegments", () => {
  it("joins phrases in order and drops silent ones", () => {
    expect(joinSegments(["My project was about bees.", "", "  ", "I learned a lot. "])).toBe(
      "My project was about bees. I learned a lot.",
    );
  });
  it("is empty for no speech", () => {
    expect(joinSegments([])).toBe("");
  });
});

describe("elapsedSeconds", () => {
  it("counts whole seconds and stops at the cap", () => {
    expect(elapsedSeconds(1000, 1999, 150)).toBe(0);
    expect(elapsedSeconds(1000, 62_500, 150)).toBe(61);
    expect(elapsedSeconds(0, 999_999, 150)).toBe(150);
    expect(elapsedSeconds(5000, 1000, 150)).toBe(0);
  });
});

it("counts words", () => {
  expect(wordCount("  I think   so ")).toBe(3);
  expect(wordCount("")).toBe(0);
});
