import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Streak } from "@/types/database";

const { maybeSingle, upsert } = vi.hoisted(() => ({ maybeSingle: vi.fn(), upsert: vi.fn() }));

vi.mock("@/lib/supabase/browserClient", () => ({
  supabase: {
    from: () => {
      const chain = { select: () => chain, eq: () => chain, maybeSingle, upsert };
      return chain;
    },
  },
}));

import { FREEZE_EARN_INTERVAL_DAYS, MAX_FREEZES, computeNextStreak, touchStreak } from "./streaks";

function makeStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    profile_id: "user-1",
    current_streak: 5,
    longest_streak: 5,
    last_active_date: "2026-09-20",
    last_reminder_sent_at: null,
    freeze_count: 0,
    last_freeze_award_streak: 0,
    updated_at: "2026-09-20T10:00:00.000Z",
    ...overrides,
  };
}

describe("computeNextStreak — first ever activity", () => {
  it("starts the streak at 1 with no freeze", () => {
    const { streak, freezeUsed, freezeEarned } = computeNextStreak(null, "user-1", "2026-09-21");
    expect(streak).toMatchObject({ current_streak: 1, longest_streak: 1, freeze_count: 0 });
    expect(freezeUsed).toBe(false);
    expect(freezeEarned).toBe(false);
  });
});

describe("computeNextStreak — already recorded today", () => {
  it("is a no-op and returns the exact same object", () => {
    const existing = makeStreak({ last_active_date: "2026-09-21" });
    const result = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(result.streak).toBe(existing);
    expect(result.freezeUsed).toBe(false);
    expect(result.freezeEarned).toBe(false);
  });
});

describe("computeNextStreak — consecutive day (gap === 1)", () => {
  it("increments the streak without touching freezes", () => {
    const existing = makeStreak({ current_streak: 5, longest_streak: 5, freeze_count: 1 });
    const { streak, freezeUsed } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(streak.current_streak).toBe(6);
    expect(streak.freeze_count).toBe(1);
    expect(freezeUsed).toBe(false);
  });

  it("raises longest_streak once current_streak passes it", () => {
    const existing = makeStreak({ current_streak: 5, longest_streak: 5 });
    const { streak } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(streak.longest_streak).toBe(6);
  });
});

describe("computeNextStreak — one missed day (gap === 2)", () => {
  it("resets to 1 when no freeze is available", () => {
    const existing = makeStreak({ current_streak: 5, freeze_count: 0, last_active_date: "2026-09-19" });
    const { streak, freezeUsed } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(streak.current_streak).toBe(1);
    expect(freezeUsed).toBe(false);
  });

  it("auto-consumes a freeze and continues the streak when one is available", () => {
    const existing = makeStreak({ current_streak: 5, freeze_count: 1, last_active_date: "2026-09-19" });
    const { streak, freezeUsed } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(streak.current_streak).toBe(6);
    expect(streak.freeze_count).toBe(0);
    expect(freezeUsed).toBe(true);
  });
});

describe("computeNextStreak — more than one missed day (gap > 2)", () => {
  it("resets to 1 even with a freeze available — a freeze only bridges one day", () => {
    const existing = makeStreak({ current_streak: 10, freeze_count: 2, last_active_date: "2026-09-15" });
    const { streak, freezeUsed } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(streak.current_streak).toBe(1);
    expect(streak.freeze_count).toBe(2);
    expect(freezeUsed).toBe(false);
  });

  it("resets the freeze-earning baseline so the next freeze isn't delayed", () => {
    const existing = makeStreak({
      current_streak: 30,
      last_freeze_award_streak: 28,
      freeze_count: 0,
      last_active_date: "2026-09-10",
    });
    const { streak } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(streak.last_freeze_award_streak).toBe(0);
  });
});

describe("computeNextStreak — earning a freeze", () => {
  it(`awards a freeze once the streak crosses ${FREEZE_EARN_INTERVAL_DAYS} days past the last award`, () => {
    const existing = makeStreak({
      current_streak: FREEZE_EARN_INTERVAL_DAYS - 1,
      last_freeze_award_streak: 0,
      freeze_count: 0,
      last_active_date: "2026-09-20",
    });
    const { streak, freezeEarned } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(streak.current_streak).toBe(FREEZE_EARN_INTERVAL_DAYS);
    expect(freezeEarned).toBe(true);
    expect(streak.freeze_count).toBe(1);
    expect(streak.last_freeze_award_streak).toBe(FREEZE_EARN_INTERVAL_DAYS);
  });

  it(`never exceeds ${MAX_FREEZES} held freezes`, () => {
    const existing = makeStreak({
      current_streak: FREEZE_EARN_INTERVAL_DAYS * 3 - 1,
      last_freeze_award_streak: FREEZE_EARN_INTERVAL_DAYS * 2,
      freeze_count: MAX_FREEZES,
      last_active_date: "2026-09-20",
    });
    const { streak, freezeEarned } = computeNextStreak(existing, "user-1", "2026-09-21");
    expect(freezeEarned).toBe(false);
    expect(streak.freeze_count).toBe(MAX_FREEZES);
  });

  it("does not award a freeze on the very same day one is consumed to bridge a gap, unless the interval is also crossed", () => {
    const existing = makeStreak({
      current_streak: 6,
      last_freeze_award_streak: 0,
      freeze_count: 1,
      last_active_date: "2026-09-19", // gap of 2 → consumes the freeze
    });
    const { streak, freezeUsed, freezeEarned } = computeNextStreak(existing, "user-1", "2026-09-21");
    // current_streak becomes 7, which does cross the interval again — this
    // documents that a bridged day can immediately re-earn a freeze.
    expect(streak.current_streak).toBe(7);
    expect(freezeUsed).toBe(true);
    expect(freezeEarned).toBe(true);
    expect(streak.freeze_count).toBe(1); // consumed one, earned one back
  });
});

describe("touchStreak", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    upsert.mockResolvedValue({ error: null });
  });

  it("writes a new row on a learner's very first activity", async () => {
    maybeSingle.mockResolvedValue({ data: null });
    const streak = await touchStreak("user-1");
    expect(streak.current_streak).toBe(1);
    expect(upsert).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ current_streak: 1 }));
  });

  it("does not write anything when today is already recorded", async () => {
    const today = new Date().toISOString().slice(0, 10);
    maybeSingle.mockResolvedValue({ data: makeStreak({ last_active_date: today }) });
    await touchStreak("user-1");
    expect(upsert).not.toHaveBeenCalled();
  });
});
