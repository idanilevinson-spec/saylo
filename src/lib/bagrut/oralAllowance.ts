// How many graded question sets a learner may use (docs/specs/bagrut-oral.md
// §4). A full simulation is four sets (A, B, C1, C2). Counted from
// ai_usage_log rows of ORAL_GRADE_FEATURE, so a failed AI call that still
// cost money counts too; the allowance has one set of slack per simulation
// for that.
export const ORAL_GRADE_FEATURE = "bagrut_oral_grade";
// The proofreading pass after each grade; logged for cost, never counted.
export const ORAL_REVIEW_FEATURE = "bagrut_oral_review";
export const SETS_PER_SIMULATION = 4;
// Paid: two simulations in any 24 hours. Trial: one simulation, ever.
export const PAID_SETS_PER_DAY = 2 * SETS_PER_SIMULATION + 2;
export const TRIAL_SETS_TOTAL = SETS_PER_SIMULATION + 1;

export function oralGradeAllowed(opts: { paid: boolean; usedLast24h: number; usedEver: number }): boolean {
  return opts.paid ? opts.usedLast24h < PAID_SETS_PER_DAY : opts.usedEver < TRIAL_SETS_TOTAL;
}

// Before a simulation starts: is there room for all four sets? Checked up
// front so nobody records for four minutes and only then hears "limit".
export function oralSimulationAvailable(opts: { paid: boolean; usedLast24h: number; usedEver: number }): boolean {
  return opts.paid
    ? opts.usedLast24h + SETS_PER_SIMULATION <= PAID_SETS_PER_DAY
    : opts.usedEver + SETS_PER_SIMULATION <= TRIAL_SETS_TOTAL;
}

export const ORAL_LIMIT_ERROR = "oral grade limit";
