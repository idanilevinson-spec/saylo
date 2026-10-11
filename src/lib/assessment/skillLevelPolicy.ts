import { CEFR_ORDER, capLevelToContentDifficulty, cefrLevelFromPercent } from "./cefrScoring";
import type { CefrLevel } from "@/types/database";

// How a learner's level in one skill moves after the placement test.
//
// The placement curve (cefrLevelFromPercent) reads a raw score from a test
// that mixes every level. Practice doesn't: a learner works at their own
// level, where 70% right is a good result. Read through the placement
// curve, that 70% said "B2" and sent a C2 learner down two levels; two
// answers, one of them wrong, sent them to B1. So once a learner has a
// level, it moves one step at a time, relative to the level of the
// content they actually did:
// - up a level after doing well on content at or above their level,
// - down a level after struggling on content at or below it,
// - otherwise it stays.

export const MIN_ATTEMPTS_TO_MOVE = 10;
const UP_AT = 80; // percent correct
const DOWN_BELOW = 50;

const idx = (l: CefrLevel) => CEFR_ORDER.indexOf(l);
const step = (l: CefrLevel, by: 1 | -1): CefrLevel => CEFR_ORDER[Math.min(CEFR_ORDER.length - 1, Math.max(0, idx(l) + by))];

// The level most of these attempts were at (ties go to the harder level).
export function typicalLevel(levels: CefrLevel[]): CefrLevel | null {
  if (levels.length === 0) return null;
  const counts = new Map<CefrLevel, number>();
  for (const l of levels) counts.set(l, (counts.get(l) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || idx(b[0]) - idx(a[0]))[0][0];
}

function moveFrom(current: CefrLevel, percent: number, contentLevel: CefrLevel): CefrLevel {
  if (percent >= UP_AT && idx(contentLevel) >= idx(current)) return step(current, 1);
  if (percent < DOWN_BELOW && idx(contentLevel) <= idx(current)) return step(current, -1);
  return current;
}

/**
 * The level after a run of practice attempts. `attempts` are the ones made
 * since the level last changed (newest first is fine). Returns null when
 * nothing should be written.
 */
export function levelFromAttempts(
  current: CefrLevel | null,
  attempts: { isCorrect: boolean; contentLevel: CefrLevel }[],
): CefrLevel | null {
  if (attempts.length < MIN_ATTEMPTS_TO_MOVE) return null;
  const percent = Math.round((attempts.filter((a) => a.isCorrect).length / attempts.length) * 100);
  const content = typicalLevel(attempts.map((a) => a.contentLevel)) as CefrLevel;
  if (!current) {
    // No placement yet: the old reading, capped at the hardest content tried.
    const hardest = attempts.reduce<CefrLevel>((m, a) => (idx(a.contentLevel) > idx(m) ? a.contentLevel : m), "A1");
    return capLevelToContentDifficulty(cefrLevelFromPercent(percent), hardest);
  }
  const next = moveFrom(current, percent, content);
  return next === current ? null : next;
}

/**
 * The level after one scored piece of work (a writing task, an open reading
 * answer, a conversation). One result moves the level by one step at most.
 * `contentLevel` is the task's level; conversations have none and count as
 * the learner's own level.
 */
export function levelFromScore(current: CefrLevel | null, percent: number, contentLevel?: CefrLevel | null): CefrLevel | null {
  const p = Math.max(0, Math.min(100, percent));
  if (!current) {
    const raw = cefrLevelFromPercent(p);
    return contentLevel ? capLevelToContentDifficulty(raw, contentLevel) : raw;
  }
  const next = moveFrom(current, p, contentLevel ?? current);
  return next === current ? null : next;
}
