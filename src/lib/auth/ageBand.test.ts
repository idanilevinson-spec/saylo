import { describe, it, expect } from "vitest";
import { deriveAgeBand } from "./ageBand";

describe("deriveAgeBand", () => {
  it.each([
    [4, "child"],
    [12, "child"],
    [13, "teen"],
    [17, "teen"],
    [18, "adult"],
    [80, "adult"],
  ] as const)("maps age %i to %s", (age, expected) => {
    expect(deriveAgeBand(age)).toBe(expected);
  });
});
