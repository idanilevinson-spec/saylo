import { describe, expect, it } from "vitest";
import { oralGradeAllowed, oralSimulationAvailable, PAID_SETS_PER_DAY, TRIAL_SETS_TOTAL } from "./oralAllowance";

describe("oralGradeAllowed", () => {
  it("paid learners: a daily allowance, history doesn't matter", () => {
    expect(oralGradeAllowed({ paid: true, usedLast24h: 0, usedEver: 500 })).toBe(true);
    expect(oralGradeAllowed({ paid: true, usedLast24h: PAID_SETS_PER_DAY - 1, usedEver: 0 })).toBe(true);
    expect(oralGradeAllowed({ paid: true, usedLast24h: PAID_SETS_PER_DAY, usedEver: 0 })).toBe(false);
  });

  it("trial learners: one simulation in total, not per day", () => {
    expect(oralGradeAllowed({ paid: false, usedLast24h: 0, usedEver: TRIAL_SETS_TOTAL - 1 })).toBe(true);
    expect(oralGradeAllowed({ paid: false, usedLast24h: 0, usedEver: TRIAL_SETS_TOTAL })).toBe(false);
  });
});

describe("oralSimulationAvailable", () => {
  it("needs room for all four sets before starting", () => {
    expect(oralSimulationAvailable({ paid: true, usedLast24h: PAID_SETS_PER_DAY - 4, usedEver: 0 })).toBe(true);
    expect(oralSimulationAvailable({ paid: true, usedLast24h: PAID_SETS_PER_DAY - 3, usedEver: 0 })).toBe(false);
    expect(oralSimulationAvailable({ paid: false, usedLast24h: 0, usedEver: 0 })).toBe(true);
    // The trial's one simulation, once used, is used.
    expect(oralSimulationAvailable({ paid: false, usedLast24h: 0, usedEver: 4 })).toBe(false);
  });
});
