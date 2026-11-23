// How many writing checks a learner may use (docs/specs/bagrut-writing-check.md
// §4). Counted from ai_usage_log rows of WRITING_CHECK_FEATURE, so a failed
// AI call that still cost money counts too.
export const WRITING_CHECK_FEATURE = "bagrut_writing_check";
// Paid: five checks in any 24 hours, enough to write, fix and check again.
// Trial: two checks, ever. The support assistant quotes these two numbers.
export const PAID_WRITING_CHECKS_PER_DAY = 5;
export const TRIAL_WRITING_CHECKS = 2;

export function writingCheckAllowed(opts: { paid: boolean; usedLast24h: number; usedEver: number }): boolean {
  return opts.paid ? opts.usedLast24h < PAID_WRITING_CHECKS_PER_DAY : opts.usedEver < TRIAL_WRITING_CHECKS;
}

export const WRITING_LIMIT_ERROR = "writing check limit";
