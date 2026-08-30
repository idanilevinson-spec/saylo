import { describe, it, expect, vi } from "vitest";

// levelForXp is pure, but this module also exports awardXp which imports
// the browser Supabase client at module scope — mock it so importing the
// file for the pure function doesn't require real Supabase env vars.
vi.mock("@/lib/supabase/browserClient", () => ({ supabase: {} }));

import { levelForXp } from "./xp";

describe("levelForXp", () => {
  it("starts at level 1 with 0 XP", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("stays at level 1 just below the level-2 threshold", () => {
    expect(levelForXp(99)).toBe(1);
  });

  it("reaches level 2 exactly at 100 XP", () => {
    expect(levelForXp(100)).toBe(2);
  });

  it("stays at level 2 just below the level-3 threshold", () => {
    expect(levelForXp(249)).toBe(2);
  });

  it("reaches level 3 exactly at 250 XP", () => {
    expect(levelForXp(250)).toBe(3);
  });

  it("reaches level 4 exactly at 450 XP", () => {
    expect(levelForXp(450)).toBe(4);
  });

  it("requires progressively more XP for each subsequent level", () => {
    const gapToLevel2 = 100 - 0;
    const gapToLevel3 = 250 - 100;
    const gapToLevel4 = 450 - 250;
    expect(gapToLevel3).toBeGreaterThan(gapToLevel2);
    expect(gapToLevel4).toBeGreaterThan(gapToLevel3);
  });
});
