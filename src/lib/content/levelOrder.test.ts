import { describe, expect, it } from "vitest";
import { nearestLevelWith, shelveByLevel } from "./levelOrder";
import type { CefrLevel } from "@/types/database";

const items: { id: string; level: CefrLevel }[] = [
  { id: "a1", level: "A1" },
  { id: "a2", level: "A2" },
  { id: "b1", level: "B1" },
  { id: "b1b", level: "B1" },
  { id: "b2", level: "B2" },
  { id: "c2", level: "C2" },
];

describe("shelveByLevel", () => {
  it("puts the learner's level first, then one up and one down, then the rest by level", () => {
    const s = shelveByLevel(items, "B1", (i) => i.level);
    expect(s.atLevel.map((i) => i.id)).toEqual(["b1", "b1b"]);
    expect(s.near.map((i) => i.id)).toEqual(["b2", "a2"]);
    expect(s.rest.map((g) => g.level)).toEqual(["A1", "C2"]);
  });

  it("without a level, groups everything by level", () => {
    const s = shelveByLevel(items, null, (i) => i.level);
    expect(s.atLevel).toEqual([]);
    expect(s.near).toEqual([]);
    expect(s.rest.map((g) => g.level)).toEqual(["A1", "A2", "B1", "B2", "C2"]);
  });
});

describe("nearestLevelWith", () => {
  it("prefers the level, then one up, then one down", () => {
    expect(nearestLevelWith("B1", (l) => l === "B1")).toBe("B1");
    expect(nearestLevelWith("B1", (l) => l === "A2" || l === "B2")).toBe("B2");
    expect(nearestLevelWith("C2", (l) => l === "A1")).toBe("A1");
    expect(nearestLevelWith("B1", () => false)).toBeNull();
  });
});
