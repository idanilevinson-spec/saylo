// The public rules of the Computerized Oral Bagrut Exam (COBE), from the
// Ministry of Education's "Guidelines for the Computerized Oral Bagrut Exam"
// (2021) and the winter 2026 simulation; sources in docs/specs/bagrut-oral.md.
// Structure and numbers only: no exam content is copied here.

export const ORAL_EXAM_MINUTES = 30;

export type OralPart = "A" | "B" | "C";

export const PART_POINTS: Record<OralPart, number> = { A: 25, B: 25, C: 50 };

// The rubric, applied to each question set.
export const CRITERIA = [
  { key: "topic", labelHe: "פיתוח הנושא", weight: 60 },
  { key: "delivery", labelHe: "שטף ובהירות", weight: 10 },
  { key: "vocabulary", labelHe: "אוצר מילים", weight: 20 },
  { key: "language", labelHe: "שפה ודקדוק", weight: 10 },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

// Part B only: a short answer loses part of the Topic Development grade.
// Returns the share (0..1) to deduct from that criterion.
export function partBLengthDeduction(seconds: number): number {
  if (seconds >= 60) return 0;
  if (seconds >= 50) return 0.05;
  if (seconds >= 40) return 0.1;
  if (seconds >= 16) return 0.2;
  return 1;
}

// More recordings than the "one or two" a set should take cost the whole
// set's grade. Returns the share (0..1) to deduct from all criteria.
export function recordingsDeduction(recordings: number): number {
  if (recordings <= 2) return 0;
  if (recordings <= 5) return 0.5;
  if (recordings <= 8) return 0.75;
  return 1;
}

export const PART_B_MIN_SECONDS = 60;
export const PART_B_TARGET_SECONDS = 120;
// Part B asks for one to two minutes; the recorder stops a little later so
// a learner finishing a sentence at 2:00 isn't cut off.
export const MAX_ANSWER_SECONDS = 150;

export interface CriterionScore {
  key: CriterionKey;
  // 0..100 on the rubric's scale for this criterion.
  score: number;
}

// One question set's grade out of 100: the weighted criteria, then the
// Part B length deduction on Topic Development, then the recordings
// deduction on everything.
export function setGrade(
  scores: CriterionScore[],
  opts: { part: OralPart; seconds: number; recordings: number },
): number {
  const byKey = new Map(scores.map((s) => [s.key, clamp(s.score)]));
  let total = 0;
  for (const c of CRITERIA) {
    let s = byKey.get(c.key) ?? 0;
    if (c.key === "topic" && opts.part === "B") s *= 1 - partBLengthDeduction(opts.seconds);
    total += (s * c.weight) / 100;
  }
  total *= 1 - recordingsDeduction(opts.recordings);
  return Math.round(total);
}

// The whole exam out of 100: A and B are one set each (25 points); C is two
// sets that share its 50 points equally.
export function examGrade(sets: { part: OralPart; grade: number }[]): number {
  const a = sets.find((s) => s.part === "A")?.grade ?? 0;
  const b = sets.find((s) => s.part === "B")?.grade ?? 0;
  const c = sets.filter((s) => s.part === "C").map((s) => s.grade);
  const cAvg = c.length ? c.reduce((x, y) => x + y, 0) / 2 : 0;
  return Math.round((a * PART_POINTS.A + b * PART_POINTS.B + cAvg * PART_POINTS.C) / 100);
}

function clamp(n: number): number {
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
