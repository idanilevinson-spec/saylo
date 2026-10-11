import type { CefrLevel } from "@/types/database";
import { CEFR_ORDER } from "@/lib/assessment/cefrScoring";

// Words to add to a review round as new: at the learner's level and one
// below first, then the nearest other levels if those run out.
export function newWordsAtLevel(
  unseen: { id: string; cefr_level: string }[],
  level: CefrLevel | null,
  count: number,
): string[] {
  if (!level) return unseen.slice(0, count).map((w) => w.id);
  const at = CEFR_ORDER.indexOf(level);
  const distance = (w: { cefr_level: string }) => {
    const d = CEFR_ORDER.indexOf(w.cefr_level as CefrLevel) - at;
    return d === 0 || d === -1 ? 0 : Math.abs(d) + 1;
  };
  return [...unseen]
    .map((w, i) => ({ w, i }))
    .sort((a, b) => distance(a.w) - distance(b.w) || a.i - b.i)
    .slice(0, count)
    .map(({ w }) => w.id);
}
