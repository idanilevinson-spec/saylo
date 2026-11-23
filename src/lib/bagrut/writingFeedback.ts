import { countPhrase, splitSentences } from "./oralVerify";
import { WRITING_CRITERIA, type WritingCriterionKey } from "./writingRules";

// What the AI must return for one writing check, and what code then makes
// true against the learner's own text (docs/specs/bagrut-writing-check.md
// §3). The same lesson as the oral simulation (oralVerify.ts): an AI asked
// to quote a text sometimes "quotes" words that are not in it, so matching
// words is code's job.

export interface WritingFix {
  wrote: string;
  better: string;
  whyHe: string;
}

export interface WritingFeedback {
  scores: Record<WritingCriterionKey, number>;
  notesHe: Record<WritingCriterionKey, string>;
  // Nothing to do with the task, or impossible to follow: the whole task is
  // worth zero.
  zero: boolean;
  fixes: WritingFix[];
  improved: string;
}

const MAX_NOTE = 400;
const MAX_IMPROVED = 2000;
const MAX_FIXES = 5;

const wordsOnly = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

// Anything off → null, and the route reports a failed check instead of
// showing a made-up one. Scores are clamped to the rubric later, in
// gradeWriting.
export function parseWritingFeedback(raw: unknown): WritingFeedback | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const scoresIn = r.points as Record<string, unknown> | undefined;
  const notesIn = r.notesHe as Record<string, unknown> | undefined;
  if (!scoresIn || typeof scoresIn !== "object" || !notesIn || typeof notesIn !== "object") return null;

  const scores = {} as Record<WritingCriterionKey, number>;
  const notesHe = {} as Record<WritingCriterionKey, string>;
  for (const { key } of WRITING_CRITERIA) {
    const s = scoresIn[key];
    const n = str(notesIn[key], MAX_NOTE);
    if (typeof s !== "number" || !Number.isFinite(s) || !n) return null;
    scores[key] = s;
    notesHe[key] = n;
  }

  // Paragraph breaks are part of an essay, so they are kept here.
  const improved = typeof r.improved === "string" ? r.improved.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_IMPROVED) : "";
  if (!improved) return null;

  const fixes = Array.isArray(r.fixes)
    ? r.fixes
        .map((f) => {
          const o = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
          return { wrote: str(o.wrote, 160), better: str(o.better, 160), whyHe: str(o.whyHe, 300) };
        })
        // A "correction" that changes nothing but case or punctuation is
        // the model talking itself out of a mistake; it is not shown.
        .filter((f) => f.wrote && f.better && f.whyHe && wordsOnly(f.wrote) !== wordsOnly(f.better))
        .slice(0, MAX_FIXES)
    : [];

  return { scores, notesHe, zero: r.zero === true, fixes, improved };
}

// A quote in a note: opens after anything but a Latin letter (a Hebrew
// prefix like ב' is fine), closes before anything but a Latin letter, and
// may hold an apostrophe between two letters ('I don't like', 'it's').
const QUOTE = /(?<![A-Za-z])'((?:[^']|(?<=[A-Za-z])'(?=[A-Za-z]))*[A-Za-z](?:[^']|(?<=[A-Za-z])'(?=[A-Za-z]))*)'(?![A-Za-z])/g;

// A note may carry English only as an exact quote from the learner's text.
function sentenceBreaksRule(sentence: string, text: string): boolean {
  for (const m of sentence.matchAll(QUOTE)) if (countPhrase(text, m[1]) === 0) return true;
  return /[A-Za-z]/.test(sentence.replace(QUOTE, " "));
}

const FALLBACK_NOTE: Record<WritingCriterionKey, string> = {
  content: "כדאי לבדוק שכל חלק של המטלה קיבל תשובה, ושלכל רעיון יש הסבר או דוגמה.",
  vocabulary: "כדאי לגוון את המילים ולהוסיף מילות קישור בין המשפטים.",
  language: "כדאי לעבור על הזמנים של הפעלים ועל סדר המילים במשפט.",
  mechanics: "כדאי לעבור על האיות, על האותיות הגדולות בתחילת משפט ועל הנקודות בסופו.",
};

// A correction is shown only when the words it corrects are in the text;
// a note keeps only the sentences that quote the text truthfully, and a
// note left empty gets a plain, true sentence instead.
export function verifyWritingFeedback(feedback: WritingFeedback, text: string): WritingFeedback {
  const notesHe = { ...feedback.notesHe };
  for (const { key } of WRITING_CRITERIA) {
    const kept = splitSentences(notesHe[key]).filter((s) => !sentenceBreaksRule(s, text));
    notesHe[key] = kept.length ? kept.join(" ") : FALLBACK_NOTE[key];
  }
  return {
    ...feedback,
    notesHe,
    fixes: feedback.fixes.filter((f) => countPhrase(text, f.wrote) > 0),
  };
}
