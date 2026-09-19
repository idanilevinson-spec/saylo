import { beforeEach, describe, expect, it, vi } from "vitest";

const { countQuery, awardXp, touchStreak, checkAndAwardBadges, isUserPremium, spendHeartOnMistake } = vi.hoisted(() => ({
  countQuery: vi.fn(),
  awardXp: vi.fn(),
  touchStreak: vi.fn(),
  checkAndAwardBadges: vi.fn(),
  isUserPremium: vi.fn(),
  spendHeartOnMistake: vi.fn(),
}));

vi.mock("@/lib/supabase/browserClient", () => ({
  supabase: {
    from: () => {
      const chain = { select: () => chain, eq: () => chain, then: (res: (v: unknown) => unknown) => res(countQuery()) };
      return chain;
    },
  },
}));
vi.mock("@/lib/gamification/xp", () => ({ awardXp }));
vi.mock("@/lib/gamification/streaks", () => ({ touchStreak }));
vi.mock("@/lib/gamification/badges", () => ({ checkAndAwardBadges }));
vi.mock("@/lib/subscriptions/subscriptionService", () => ({ isUserPremium }));
vi.mock("@/lib/subscriptions/heartsService", () => ({ spendHeartOnMistake }));

import { runSerially, settleAnswer } from "./answerTail";

beforeEach(() => {
  vi.resetAllMocks();
  countQuery.mockReturnValue({ count: 7 });
  awardXp.mockResolvedValue({ totalXp: 120, level: 2 });
  touchStreak.mockResolvedValue({ current_streak: 3 });
  checkAndAwardBadges.mockResolvedValue([]);
  isUserPremium.mockResolvedValue(false);
  spendHeartOnMistake.mockResolvedValue({ current: 4, max: 5 });
});

describe("runSerially", () => {
  it("runs tasks one at a time, in the order they were queued", async () => {
    const order: string[] = [];
    const slow = runSerially(async () => {
      order.push("slow:start");
      await new Promise((r) => setTimeout(r, 20));
      order.push("slow:end");
    });
    const fast = runSerially(async () => {
      order.push("fast");
    });
    await Promise.all([slow, fast]);
    expect(order).toEqual(["slow:start", "slow:end", "fast"]);
  });

  it("keeps the queue moving after a task fails", async () => {
    const failing = runSerially(async () => {
      throw new Error("boom");
    });
    await expect(failing).rejects.toThrow("boom");
    await expect(runSerially(async () => "still works")).resolves.toBe("still works");
  });
});

describe("settleAnswer", () => {
  it("awards 10 XP for a correct answer and never touches hearts or the subscription check", async () => {
    const result = await settleAnswer("p1", { isCorrect: true, xpSource: "exercise_correct" });
    expect(awardXp).toHaveBeenCalledWith("p1", "exercise_correct", 10);
    expect(isUserPremium).not.toHaveBeenCalled();
    expect(spendHeartOnMistake).not.toHaveBeenCalled();
    expect(result).toMatchObject({ xpAwarded: 10, totalXp: 120, currentStreak: 3, heartsRemaining: null });
    expect(checkAndAwardBadges).toHaveBeenCalledWith("p1", { totalXp: 120, currentStreak: 3, correctAttemptsCount: 7 });
  });

  it("costs a non-premium learner a heart for a wrong answer", async () => {
    const result = await settleAnswer("p1", { isCorrect: false, xpSource: "exercise_attempt" });
    expect(awardXp).toHaveBeenCalledWith("p1", "exercise_attempt", 2);
    expect(spendHeartOnMistake).toHaveBeenCalledWith("p1");
    expect(result.heartsRemaining).toBe(4);
  });

  it("never costs a premium learner a heart", async () => {
    isUserPremium.mockResolvedValue(true);
    const result = await settleAnswer("p1", { isCorrect: false, xpSource: "exercise_attempt" });
    expect(spendHeartOnMistake).not.toHaveBeenCalled();
    expect(result.heartsRemaining).toBeNull();
  });

  it("counts correct answers only after this answer's own attempt row is written", async () => {
    let writeAttempt!: () => void;
    const attemptWritten = new Promise<void>((resolve) => {
      writeAttempt = resolve;
    });
    const settled = settleAnswer("p1", { isCorrect: true, xpSource: "exercise_correct", attemptWritten });

    await new Promise((r) => setTimeout(r, 10));
    expect(countQuery).not.toHaveBeenCalled();

    writeAttempt();
    await settled;
    expect(countQuery).toHaveBeenCalledTimes(1);
  });
});
