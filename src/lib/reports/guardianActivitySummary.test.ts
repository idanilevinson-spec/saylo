import { describe, expect, it, vi } from "vitest";
import { getGuardianActivitySummary } from "./guardianActivitySummary";

vi.mock("@/lib/reports/buildScoreSummary", () => ({
  buildScoreSummary: vi.fn(async () => ({
    range: "week",
    since: null,
    testsCount: 12,
    averageScore: 88,
    xpEarned: 340,
    items: [{ id: "x", createdAt: "2026-09-28", typeLabel: "תרגיל", detail: "פרטים פרטיים", scorePct: 90 }],
  })),
}));

function makeSupabase(streak: { current_streak: number } | null, cefr: string | null) {
  return {
    from: (table: string) => {
      if (table === "streaks") {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: streak }) }) }) };
      }
      if (table === "placement_tests") {
        const chain = {
          eq: () => chain,
          order: () => chain,
          limit: () => chain,
          maybeSingle: async () => ({ data: cefr ? { result_cefr_overall: cefr } : null }),
        };
        return { select: () => chain };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  } as never;
}

describe("getGuardianActivitySummary", () => {
  it("returns only the four coarse fields, never the underlying items list", async () => {
    const result = await getGuardianActivitySummary(makeSupabase({ current_streak: 5 }, "B1"), "profile-1");
    expect(result).toEqual({ testsCount: 12, xpEarned: 340, currentStreak: 5, cefrLevel: "B1" });
    expect(Object.keys(result)).not.toContain("items");
  });

  it("defaults to a 0 streak and a null level when there is no data yet", async () => {
    const result = await getGuardianActivitySummary(makeSupabase(null, null), "profile-1");
    expect(result.currentStreak).toBe(0);
    expect(result.cefrLevel).toBeNull();
  });
});
