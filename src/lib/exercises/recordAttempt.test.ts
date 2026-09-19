import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Exercise } from "@/types/database";

const { insert, settleAnswer, updateSrs, refreshSkill } = vi.hoisted(() => ({
  insert: vi.fn(),
  settleAnswer: vi.fn(),
  updateSrs: vi.fn(),
  refreshSkill: vi.fn(),
}));

vi.mock("@/lib/supabase/browserClient", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("@/lib/gamification/answerTail", () => ({
  runSerially: <T,>(task: () => Promise<T>) => task(),
  settleAnswer,
  XP_CORRECT: 10,
  XP_ATTEMPT: 2,
}));
vi.mock("@/lib/srs/queue", () => ({ updateSrsForVocabularyItem: updateSrs }));
vi.mock("@/lib/assessment/skillLevel", () => ({ refreshSkillLevelFromAttempts: refreshSkill }));

import { startAttempt } from "./recordAttempt";

const mcq = {
  id: "e1",
  type: "mcq",
  skill_area: "vocabulary",
  vocabulary_item_id: "v1",
  content: { prompt: "?", options: ["a", "b"], correctIndex: 1 },
} as unknown as Exercise;

beforeEach(() => {
  vi.resetAllMocks();
  insert.mockResolvedValue({ error: null });
  settleAnswer.mockResolvedValue({
    xpAwarded: 10,
    totalXp: 50,
    level: 1,
    currentStreak: 2,
    newBadges: [],
    heartsRemaining: null,
  });
  updateSrs.mockResolvedValue({ repetitions: 1, intervalDays: 1, easeFactor: 2.5 });
  refreshSkill.mockResolvedValue(undefined);
});

describe("startAttempt", () => {
  it("grades locally and reports the verdict before any network work finishes", async () => {
    insert.mockReturnValue(new Promise(() => undefined)); // the save never completes
    const attempt = startAttempt("p1", mcq, { selectedIndex: 1 });
    expect(attempt.isCorrect).toBe(true);
    expect(attempt.xpAwarded).toBe(10);
  });

  it("scores a wrong answer as incorrect with the smaller XP award", () => {
    const attempt = startAttempt("p1", mcq, { selectedIndex: 0 });
    expect(attempt.isCorrect).toBe(false);
    expect(attempt.xpAwarded).toBe(2);
  });

  it("saves the attempt, updates SRS for vocabulary questions and resolves with the full result", async () => {
    const attempt = startAttempt("p1", mcq, { selectedIndex: 1 });
    const result = await attempt.done;
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ profile_id: "p1", exercise_id: "e1", is_correct: true })
    );
    expect(updateSrs).toHaveBeenCalledWith("p1", "v1", true);
    expect(settleAnswer).toHaveBeenCalledWith("p1", expect.objectContaining({ isCorrect: true, xpSource: "exercise_correct" }));
    expect(result).toMatchObject({ isCorrect: true, totalXp: 50, currentStreak: 2 });
  });
});
