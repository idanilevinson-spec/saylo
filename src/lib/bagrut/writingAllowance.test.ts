import { describe, expect, it } from "vitest";
import { PAID_WRITING_CHECKS_PER_DAY, TRIAL_WRITING_CHECKS, writingCheckAllowed } from "./writingAllowance";

describe("writingCheckAllowed", () => {
  it("paid learners: a daily allowance, history doesn't matter", () => {
    expect(writingCheckAllowed({ paid: true, usedLast24h: 0, usedEver: 900 })).toBe(true);
    expect(writingCheckAllowed({ paid: true, usedLast24h: PAID_WRITING_CHECKS_PER_DAY - 1, usedEver: 0 })).toBe(true);
    expect(writingCheckAllowed({ paid: true, usedLast24h: PAID_WRITING_CHECKS_PER_DAY, usedEver: 0 })).toBe(false);
  });

  it("trial learners: a total, not per day", () => {
    expect(writingCheckAllowed({ paid: false, usedLast24h: 0, usedEver: TRIAL_WRITING_CHECKS - 1 })).toBe(true);
    expect(writingCheckAllowed({ paid: false, usedLast24h: 0, usedEver: TRIAL_WRITING_CHECKS })).toBe(false);
  });
});
