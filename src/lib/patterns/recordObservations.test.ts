import { beforeEach, describe, expect, it, vi } from "vitest";

const { upsert } = vi.hoisted(() => ({ upsert: vi.fn() }));

vi.mock("@/lib/supabase/adminClient", () => ({
  supabaseAdmin: { from: () => ({ upsert }) },
}));

import { recordPatternObservations } from "./recordObservations";

beforeEach(() => {
  vi.resetAllMocks();
  upsert.mockResolvedValue({ error: null });
});

describe("recordPatternObservations", () => {
  it("does nothing for a non-adult profile", async () => {
    await recordPatternObservations({
      profileId: "p1",
      ageBand: "teen",
      source: "writing",
      sourceId: "s1",
      sourceText: "She happy today.",
      rawAiPatterns: [{ code: "MISSING_COPULA", quote: "She happy today" }],
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("does nothing for empty source text", async () => {
    await recordPatternObservations({
      profileId: "p1",
      ageBand: "adult",
      source: "writing",
      sourceId: "s1",
      sourceText: "   ",
      rawAiPatterns: [],
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("does nothing when nothing validated and no rule-based hits", async () => {
    await recordPatternObservations({
      profileId: "p1",
      ageBand: "adult",
      source: "writing",
      sourceId: "s1",
      sourceText: "This is a perfectly fine sentence.",
      rawAiPatterns: [{ code: "MISSING_COPULA", quote: "not in the text" }],
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("combines AI-validated and rule-based patterns for writing", async () => {
    await recordPatternObservations({
      profileId: "p1",
      ageBand: "adult",
      source: "writing",
      sourceId: "s1",
      sourceText: "she happy today and i dont know why",
      rawAiPatterns: [{ code: "MISSING_COPULA", quote: "she happy today" }],
    });
    expect(upsert).toHaveBeenCalledTimes(1);
    const [rows, options] = upsert.mock.calls[0];
    expect(options).toEqual({ onConflict: "source,source_id,pattern_code", ignoreDuplicates: true });
    const codes = (rows as Array<{ pattern_code: string }>).map((r) => r.pattern_code).sort();
    expect(codes).toEqual(["APOSTROPHE", "CAPITALIZATION", "MISSING_COPULA"].sort());
    for (const row of rows as Array<Record<string, unknown>>) {
      expect(row.profile_id).toBe("p1");
      expect(row.source).toBe("writing");
      expect(row.source_id).toBe("s1");
      expect(row.sample_words).toBeGreaterThan(0);
    }
  });

  it("never emits rule-based spelling patterns for a conversation", async () => {
    await recordPatternObservations({
      profileId: "p1",
      ageBand: "adult",
      source: "conversation",
      sourceId: "c1",
      sourceText: "she happy today and i dont know why",
      rawAiPatterns: [{ code: "MISSING_COPULA", quote: "she happy today" }],
    });
    const [rows] = upsert.mock.calls[0];
    const codes = (rows as Array<{ pattern_code: string }>).map((r) => r.pattern_code);
    expect(codes).toEqual(["MISSING_COPULA"]);
  });

  it("swallows a database error instead of throwing", async () => {
    upsert.mockResolvedValue({ error: new Error("boom") });
    await expect(
      recordPatternObservations({
        profileId: "p1",
        ageBand: "adult",
        source: "writing",
        sourceId: "s1",
        sourceText: "she happy today",
        rawAiPatterns: [{ code: "MISSING_COPULA", quote: "she happy today" }],
      })
    ).resolves.toBeUndefined();
  });
});
