import { describe, expect, it } from "vitest";
import { levelFromAttempts, levelFromScore, typicalLevel, MIN_ATTEMPTS_TO_MOVE } from "./skillLevelPolicy";
import type { CefrLevel } from "@/types/database";

const run = (n: number, correct: number, level: CefrLevel) =>
  Array.from({ length: n }, (_, i) => ({ isCorrect: i < correct, contentLevel: level }));

describe("levelFromAttempts", () => {
  it("doesn't move on a handful of answers (the C2 → B1 after two answers bug)", () => {
    expect(levelFromAttempts("C2", run(2, 1, "C2"))).toBeNull();
    expect(levelFromAttempts("C2", run(MIN_ATTEMPTS_TO_MOVE - 1, 0, "C2"))).toBeNull();
  });

  it("keeps the level for normal results at the learner's level", () => {
    expect(levelFromAttempts("C2", run(10, 7, "C2"))).toBeNull();
    expect(levelFromAttempts("B1", run(20, 12, "B1"))).toBeNull();
  });

  it("moves up one step after doing well at or above the level", () => {
    expect(levelFromAttempts("B1", run(10, 9, "B1"))).toBe("B2");
    expect(levelFromAttempts("B1", run(10, 8, "B2"))).toBe("B2");
  });

  it("doesn't move up for acing easier content", () => {
    expect(levelFromAttempts("B1", run(10, 10, "A2"))).toBeNull();
  });

  it("moves down one step after struggling at or below the level", () => {
    expect(levelFromAttempts("C2", run(10, 3, "C2"))).toBe("C1");
    expect(levelFromAttempts("B2", run(10, 2, "B1"))).toBe("B1");
  });

  it("doesn't move down for struggling with harder content", () => {
    expect(levelFromAttempts("B1", run(10, 2, "C1"))).toBeNull();
  });

  it("stays within A1..C2", () => {
    expect(levelFromAttempts("C2", run(10, 10, "C2"))).toBeNull();
    expect(levelFromAttempts("A1", run(10, 0, "A1"))).toBeNull();
  });

  it("without a placement level, reads the old curve capped at the content tried", () => {
    expect(levelFromAttempts(null, run(10, 10, "A2"))).toBe("A2");
    expect(levelFromAttempts(null, run(9, 9, "A2"))).toBeNull();
  });
});

describe("levelFromScore", () => {
  it("moves one step at most for a single scored task", () => {
    expect(levelFromScore("C2", 60, "C2")).toBeNull();
    expect(levelFromScore("C2", 30, "C2")).toBe("C1");
    expect(levelFromScore("B1", 95, "B1")).toBe("B2");
  });

  it("treats a conversation (no task level) as the learner's own level", () => {
    expect(levelFromScore("B2", 85)).toBe("C1");
    expect(levelFromScore("B2", 70)).toBeNull();
  });

  it("without a placement level, uses the old curve", () => {
    expect(levelFromScore(null, 70, "C1")).toBe("B2");
  });
});

describe("typicalLevel", () => {
  it("is the most common level, ties to the harder one", () => {
    expect(typicalLevel(["B1", "B1", "B2"])).toBe("B1");
    expect(typicalLevel(["B1", "B2"])).toBe("B2");
  });
});
