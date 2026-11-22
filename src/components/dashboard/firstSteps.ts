// Before the first practice the dashboard shows only the next step; the
// rest of the page waits under "כל האזורים". 7 of 10 real sign-ups by
// 19.11.2026 never practised, one of them right after reaching the page.
// The full page returns with the first XP. Not before placement (the
// placement card is the lead then) and not while the numbers are loading.
export function showFirstStepsOnly(totalXp: number | null, placed: boolean): boolean {
  return totalXp === 0 && placed;
}
