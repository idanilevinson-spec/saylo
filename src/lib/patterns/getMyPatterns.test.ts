import { describe, expect, it } from "vitest";
import { aggregatePatternStats, type PatternObservationRow } from "./getMyPatterns";

const NOW = new Date("2026-09-28T12:00:00.000Z");

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

function row(overrides: Partial<PatternObservationRow>): PatternObservationRow {
  return {
    pattern_code: "MISSING_COPULA",
    occurrences: 1,
    sample_words: 50,
    source: "writing",
    source_id: "s1",
    created_at: daysAgo(1),
    ...overrides,
  };
}

describe("aggregatePatternStats", () => {
  it("returns nothing below the minimum occurrence threshold", () => {
    const rows = [
      row({ source_id: "s1", occurrences: 2 }),
      row({ source_id: "s2", occurrences: 0 }), // never actually 0 in practice, just checking the boundary alone
    ];
    expect(aggregatePatternStats(rows, NOW)).toEqual([]);
  });

  it("returns nothing when occurrences only came from a single source", () => {
    const rows = [row({ source_id: "s1", occurrences: 5 })];
    expect(aggregatePatternStats(rows, NOW)).toEqual([]);
  });

  it("surfaces a pattern once it clears both thresholds", () => {
    const rows = [
      row({ source_id: "s1", occurrences: 2, sample_words: 40 }),
      row({ source_id: "s2", occurrences: 2, sample_words: 40 }),
    ];
    const result = aggregatePatternStats(rows, NOW);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ code: "MISSING_COPULA", occurrences: 4, distinctSources: 2 });
  });

  it("only counts a submission's word count once even with several tagged patterns", () => {
    const rows = [
      row({ source_id: "s1", pattern_code: "MISSING_COPULA", occurrences: 2, sample_words: 100 }),
      row({ source_id: "s1", pattern_code: "DO_SUPPORT", occurrences: 2, sample_words: 100 }),
      row({ source_id: "s2", pattern_code: "MISSING_COPULA", occurrences: 2, sample_words: 100 }),
      row({ source_id: "s2", pattern_code: "DO_SUPPORT", occurrences: 2, sample_words: 100 }),
    ];
    const result = aggregatePatternStats(rows, NOW);
    const copula = result.find((r) => r.code === "MISSING_COPULA")!;
    // 4 occurrences over 200 total words (100 + 100, not 400) = 2 per 100 words.
    expect(copula.perHundredWords).toBeCloseTo(2, 5);
  });

  it("ignores observations older than the 60-day comparison window", () => {
    const rows = [
      row({ source_id: "s1", occurrences: 5, created_at: daysAgo(90) }),
      row({ source_id: "s2", occurrences: 5, created_at: daysAgo(95) }),
    ];
    expect(aggregatePatternStats(rows, NOW)).toEqual([]);
  });

  it("returns at most the top 3 patterns, sorted by occurrence count", () => {
    const codes = ["MISSING_COPULA", "DO_SUPPORT", "MAKE_DO", "SAY_TELL"];
    const rows = codes.flatMap((code, i) => [
      row({ pattern_code: code, source_id: `${code}-a`, occurrences: 10 - i }),
      row({ pattern_code: code, source_id: `${code}-b`, occurrences: 10 - i }),
    ]);
    const result = aggregatePatternStats(rows, NOW);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.code)).toEqual(["MISSING_COPULA", "DO_SUPPORT", "MAKE_DO"]);
  });

  it("reports no trend when either 30-day window has too few words", () => {
    const rows = [
      row({ source_id: "s1", occurrences: 3, sample_words: 10 }),
      row({ source_id: "s2", occurrences: 3, sample_words: 10 }),
    ];
    const result = aggregatePatternStats(rows, NOW);
    expect(result[0].trend).toBeNull();
  });

  it("reports improving when the rate per 100 words drops between the two windows", () => {
    const rows = [
      // Previous 30-day window (31–60 days ago): high error rate.
      row({ source_id: "p1", occurrences: 10, sample_words: 100, created_at: daysAgo(40) }),
      row({ source_id: "p2", occurrences: 10, sample_words: 100, created_at: daysAgo(45) }),
      // Current 30-day window: same words, far fewer occurrences.
      row({ source_id: "c1", occurrences: 2, sample_words: 100, created_at: daysAgo(5) }),
      row({ source_id: "c2", occurrences: 1, sample_words: 100, created_at: daysAgo(10) }),
    ];
    const result = aggregatePatternStats(rows, NOW);
    expect(result[0].trend).toBe("improving");
  });

  it("reports worsening when the rate per 100 words rises between the two windows", () => {
    const rows = [
      row({ source_id: "p1", occurrences: 1, sample_words: 100, created_at: daysAgo(40) }),
      row({ source_id: "p2", occurrences: 1, sample_words: 100, created_at: daysAgo(45) }),
      row({ source_id: "c1", occurrences: 10, sample_words: 100, created_at: daysAgo(5) }),
      row({ source_id: "c2", occurrences: 10, sample_words: 100, created_at: daysAgo(10) }),
    ];
    const result = aggregatePatternStats(rows, NOW);
    expect(result[0].trend).toBe("worsening");
  });

  it("reports flat for a negligible change in rate", () => {
    const rows = [
      row({ source_id: "p1", occurrences: 3, sample_words: 100, created_at: daysAgo(40) }),
      row({ source_id: "p2", occurrences: 3, sample_words: 100, created_at: daysAgo(45) }),
      row({ source_id: "c1", occurrences: 3, sample_words: 100, created_at: daysAgo(5) }),
      row({ source_id: "c2", occurrences: 3, sample_words: 100, created_at: daysAgo(10) }),
    ];
    const result = aggregatePatternStats(rows, NOW);
    expect(result[0].trend).toBe("flat");
  });
});
