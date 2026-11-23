import type { BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";

// The public rules for marking the written Bagrut's writing task, from the
// Ministry of Education's own rubrics; sources in
// docs/specs/bagrut-writing-check.md. Structure and numbers only: no exam
// content is copied here, and the band wording in the AI prompt is ours.
//
// The Ministry publishes two writing rubrics: one out of 30 (Module C, and
// Modules C and D for external examinees) and one out of 40 (Module G, and
// Modules F and G for external examinees). Our B, D and F sets carry a
// writing task too, so each is checked with the rubric the Ministry itself
// attaches to a task of that kind and score.

export type WritingRubricId = "C" | "G";

export const WRITING_CRITERIA = [
  { key: "content", labelHe: "תוכן וארגון" },
  { key: "vocabulary", labelHe: "אוצר מילים" },
  { key: "language", labelHe: "שימוש בשפה" },
  { key: "mechanics", labelHe: "כתיב ופיסוק" },
] as const;

export type WritingCriterionKey = (typeof WRITING_CRITERIA)[number]["key"];

// The four levels of each criterion (correct / partially / minimally /
// incorrect) and what each is worth. Markers may give in-between grades, so
// any whole number up to the first value is a valid score.
export const WRITING_RUBRICS: Record<WritingRubricId, { total: number; levels: Record<WritingCriterionKey, readonly number[]> }> = {
  C: {
    total: 30,
    levels: { content: [10, 7, 3, 0], vocabulary: [8, 5, 2, 0], language: [8, 5, 2, 0], mechanics: [4, 2, 1, 0] },
  },
  G: {
    total: 40,
    levels: { content: [8, 5, 2, 0], vocabulary: [10, 6, 3, 0], language: [16, 10, 5, 0], mechanics: [6, 4, 2, 0] },
  },
};

interface ModuleWritingRules {
  rubric: WritingRubricId;
  // The Ministry's "deduction for length" table for this kind of task:
  // [fewest words in the row, points off], longest first. At or above the
  // first row's word count nothing is taken off; below the last row the
  // whole task is worth zero.
  lengthTable: readonly (readonly [number, number])[];
  // Shown to the learner when the rubric is not one written for this
  // module's own exam.
  rubricNoteHe: string | null;
}

const C_TABLE = [[70, 0], [60, 1], [50, 3], [40, 6], [30, 10], [25, 15]] as const;
const D_TABLE = [[80, 0], [70, 1], [60, 2], [50, 3], [40, 6], [30, 10], [25, 15]] as const;
const SHORT_TABLE = [[35, 0], [31, 1], [26, 3], [21, 6], [16, 10], [11, 15]] as const;
const F_TABLE = [[100, 0], [90, 2], [80, 4], [70, 8], [60, 12], [50, 16], [40, 18]] as const;
const G_TABLE = [[120, 0], [110, 2], [100, 4], [90, 8], [80, 12], [70, 16], [60, 18], [50, 20]] as const;

const WRITING_RULES: Partial<Record<BagrutModuleCode, ModuleWritingRules>> = {
  B: {
    rubric: "C",
    lengthTable: SHORT_TABLE,
    rubricNoteHe: "למטלה קצרה כזו אין מחוון נפרד. הבדיקה כאן לפי מחוון הכתיבה של שאלון C (30 נקודות) וטבלת האורך שמשרד החינוך מפרסם למטלה של 35–40 מילים.",
  },
  C: { rubric: "C", lengthTable: C_TABLE, rubricNoteHe: null },
  D: {
    rubric: "C",
    lengthTable: D_TABLE,
    rubricNoteHe: "הבדיקה לפי מחוון הכתיבה שמשרד החינוך מפרסם לשאלונים C ו-D (30 נקודות).",
  },
  F: {
    rubric: "G",
    lengthTable: F_TABLE,
    rubricNoteHe: "הבדיקה לפי מחוון הכתיבה שמשרד החינוך מפרסם לשאלונים F ו-G (40 נקודות).",
  },
  G: { rubric: "G", lengthTable: G_TABLE, rubricNoteHe: null },
};

export function writingRulesFor(moduleCode: BagrutModuleCode): ModuleWritingRules | null {
  return WRITING_RULES[moduleCode] ?? null;
}

// Counted the way the page counts: runs of non-space characters.
export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

// Fewer words than this and the rubric gives the whole task zero, so there
// is nothing for a check to say (and no reason to pay for one).
export function minWordsToCheck(moduleCode: BagrutModuleCode): number {
  const rules = writingRulesFor(moduleCode);
  return rules ? rules.lengthTable[rules.lengthTable.length - 1][0] : 0;
}

// Points taken off for a text shorter than the task asks. A text that is
// too long loses nothing: the rubric has no deduction for it.
export function lengthDeduction(moduleCode: BagrutModuleCode, words: number): number {
  const rules = writingRulesFor(moduleCode);
  if (!rules) return 0;
  for (const [min, off] of rules.lengthTable) if (words >= min) return off;
  return WRITING_RUBRICS[rules.rubric].total;
}

export interface WritingGrade {
  rubric: WritingRubricId;
  // Points per criterion, on merit, as if the text were the right length.
  points: Record<WritingCriterionKey, number>;
  max: Record<WritingCriterionKey, number>;
  onMerit: number;
  lengthOff: number;
  total: number;
  outOf: number;
}

// The rubric's own order: mark on merit first, then take the length
// deduction off the result. An off-topic or unreadable text is zero.
export function gradeWriting(
  moduleCode: BagrutModuleCode,
  scores: Partial<Record<WritingCriterionKey, number>>,
  words: number,
  opts: { zero?: boolean } = {},
): WritingGrade | null {
  const rules = writingRulesFor(moduleCode);
  if (!rules) return null;
  const rubric = WRITING_RUBRICS[rules.rubric];
  const points = {} as Record<WritingCriterionKey, number>;
  const max = {} as Record<WritingCriterionKey, number>;
  for (const { key } of WRITING_CRITERIA) {
    max[key] = rubric.levels[key][0];
    const s = scores[key];
    points[key] = opts.zero || typeof s !== "number" || !Number.isFinite(s) ? 0 : Math.round(Math.min(max[key], Math.max(0, s)));
  }
  const onMerit = WRITING_CRITERIA.reduce((sum, { key }) => sum + points[key], 0);
  const lengthOff = Math.min(onMerit, lengthDeduction(moduleCode, words));
  return { rubric: rules.rubric, points, max, onMerit, lengthOff, total: onMerit - lengthOff, outOf: rubric.total };
}
