import { CEFR_ORDER } from "@/lib/assessment/cefrScoring";
import type { CefrLevel, SkillArea } from "@/types/database";

// How every content list is arranged once we know the learner's level:
// what fits them now first, then one step around it (to stretch or
// consolidate), then everything else by level. Without a level it's just
// grouped by level, easiest first.
export interface LevelShelves<T> {
  atLevel: T[];
  near: T[];
  rest: { level: CefrLevel; items: T[] }[];
}

export function shelveByLevel<T>(items: T[], level: CefrLevel | null, levelOf: (item: T) => CefrLevel): LevelShelves<T> {
  const at = level ? CEFR_ORDER.indexOf(level) : -1;
  const atLevel: T[] = [];
  const near: T[] = [];
  const restMap = new Map<CefrLevel, T[]>();
  for (const item of items) {
    const i = CEFR_ORDER.indexOf(levelOf(item));
    if (at >= 0 && i === at) atLevel.push(item);
    // One level up is listed before one level down: stretching is the
    // usual next step, consolidating the fallback.
    else if (at >= 0 && Math.abs(i - at) === 1) near.push(item);
    else {
      const l = levelOf(item);
      restMap.set(l, [...(restMap.get(l) ?? []), item]);
    }
  }
  near.sort((a, b) => {
    const da = CEFR_ORDER.indexOf(levelOf(a)) - at;
    const db = CEFR_ORDER.indexOf(levelOf(b)) - at;
    return db - da;
  });
  const rest = CEFR_ORDER.filter((l) => restMap.has(l)).map((l) => ({ level: l, items: restMap.get(l) as T[] }));
  return { atLevel, near, rest };
}

// The nearest level that actually has content: the level itself, then one
// up, one down, two up… — for "the next thing at your level" when a level
// happens to be empty for some kind of content.
export function nearestLevelWith(level: CefrLevel, has: (l: CefrLevel) => boolean): CefrLevel | null {
  const at = CEFR_ORDER.indexOf(level);
  for (let d = 0; d < CEFR_ORDER.length; d++) {
    for (const i of d === 0 ? [at] : [at + d, at - d]) {
      if (i >= 0 && i < CEFR_ORDER.length && has(CEFR_ORDER[i])) return CEFR_ORDER[i];
    }
  }
  return null;
}

export const CEFR_NAME_HE: Record<CefrLevel, string> = {
  A1: "מתחילים",
  A2: "בסיסי",
  B1: "בינוני",
  B2: "בינוני-גבוה",
  C1: "מתקדם",
  C2: "שליטה מלאה",
};

// The headline level. Skill levels are kept current by practice, so once
// at least three skills have one, their median says more about the learner
// today than a placement test taken weeks ago; before that, the test.
// Only placed learners get a headline at all — the placement test is what
// unlocks the plan.
export function overallLevel(placed: CefrLevel | null, bySkill: Partial<Record<SkillArea, CefrLevel>>): CefrLevel | null {
  if (!placed) return null;
  const live = Object.values(bySkill)
    .map((l) => CEFR_ORDER.indexOf(l as CefrLevel))
    .sort((a, b) => a - b);
  if (live.length < 3) return placed;
  return CEFR_ORDER[live[Math.floor((live.length - 1) / 2)]];
}

