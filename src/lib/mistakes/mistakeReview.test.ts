import { beforeEach, describe, expect, it, vi } from "vitest";

const { maybeSingle, upsert } = vi.hoisted(() => ({ maybeSingle: vi.fn(), upsert: vi.fn() }));

vi.mock("@/lib/supabase/browserClient", () => ({
  supabase: {
    from: () => {
      const chain = { select: () => chain, eq: () => chain, maybeSingle, upsert };
      return chain;
    },
  },
}));

import { computeNextMistakeReviewState, touchMistakeReviewItem } from "./mistakeReview";

const NOW = new Date("2026-09-28T12:00:00.000Z");

describe("computeNextMistakeReviewState", () => {
  it("does not start tracking a topic on a correct answer with no existing row", () => {
    expect(computeNextMistakeReviewState(null, true, NOW)).toBeNull();
  });

  it("starts tracking a topic on a wrong answer with no existing row", () => {
    const state = computeNextMistakeReviewState(null, false, NOW);
    expect(state).not.toBeNull();
    expect(state!.repetitions).toBe(0);
    expect(state!.due_at).toBe(new Date(NOW.getTime() + 24 * 60 * 60 * 1000).toISOString());
  });

  it("keeps advancing an existing row on a correct answer", () => {
    const existing = { ease_factor: 2.5, interval_days: 1, repetitions: 1 };
    const state = computeNextMistakeReviewState(existing, true, NOW);
    expect(state).not.toBeNull();
    expect(state!.repetitions).toBe(2);
    expect(state!.interval_days).toBeGreaterThan(existing.interval_days);
  });

  it("keeps advancing (and resetting) an existing row on another wrong answer", () => {
    const existing = { ease_factor: 2.5, interval_days: 6, repetitions: 2 };
    const state = computeNextMistakeReviewState(existing, false, NOW);
    expect(state).not.toBeNull();
    expect(state!.repetitions).toBe(0);
    expect(state!.interval_days).toBe(1);
  });
});

describe("touchMistakeReviewItem", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    upsert.mockResolvedValue({ error: null });
  });

  it("writes nothing for a correct answer on a topic never gotten wrong before", async () => {
    maybeSingle.mockResolvedValue({ data: null });
    await touchMistakeReviewItem("user-1", "grammar_topic", "topic-1", true);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("writes a new row for a wrong answer on an untracked topic", async () => {
    maybeSingle.mockResolvedValue({ data: null });
    await touchMistakeReviewItem("user-1", "grammar_topic", "topic-1", false);
    expect(upsert).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ profile_id: "user-1", item_type: "grammar_topic", item_ref: "topic-1" }),
      { onConflict: "profile_id,item_type,item_ref" }
    );
  });

  it("keeps updating an already-tracked topic on either a right or wrong answer", async () => {
    maybeSingle.mockResolvedValue({ data: { ease_factor: 2.5, interval_days: 1, repetitions: 1 } });
    await touchMistakeReviewItem("user-1", "grammar_topic", "topic-1", true);
    expect(upsert).toHaveBeenCalledOnce();
  });
});
