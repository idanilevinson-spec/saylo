import { CRITERIA, type CriterionKey } from "./oralRules";
import type { OralSetFeedback } from "./oralSets";

// What code can check about the AI's feedback, it checks, against the
// transcript (docs/specs/bagrut-oral.md). Added after a full run on the test
// account (2026-11-14): even a second AI pass asked to "check every claim"
// left "you repeated 'free time'" (said once), "you used 'repair'" (never
// said) and suggestions of words the learner had used. Counting and
// matching words is code's job.

const norm = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

// Whole-word, case- and punctuation-blind occurrences of a phrase.
export function countPhrase(transcript: string, phrase: string): number {
  const p = norm(phrase);
  if (p.trim() === "") return 0;
  const t = norm(transcript);
  let n = 0;
  for (let i = t.indexOf(p); i !== -1; i = t.indexOf(p, i + p.length - 1)) n++;
  return n;
}

// The word lists, made true: "used well" only if said, "repeated" with the
// real count and only if said twice or more, "try next" only if not said.
export function verifyWords(feedback: OralSetFeedback, transcript: string): OralSetFeedback {
  const { usedWell, repeated, tryNext } = feedback.words;
  return {
    ...feedback,
    words: {
      usedWell: usedWell.filter((w) => countPhrase(transcript, w) > 0),
      repeated: repeated
        .map((r) => ({ phrase: r.phrase, times: countPhrase(transcript, r.phrase) }))
        .filter((r) => r.times >= 2),
      tryNext: tryNext.filter((w) => countPhrase(transcript, w) === 0),
    },
  };
}

// A "Hebrew-speaker mistake" is only shown when what it quotes was said.
export function keepPatternsFromTranscript(feedback: OralSetFeedback, transcript: string): OralSetFeedback {
  return { ...feedback, patterns: feedback.patterns.filter((p) => countPhrase(transcript, p.said) > 0) };
}

const QUOTE = /'([^']*[A-Za-z][^']*)'/g;
const REPETITION = /חוזר|חוזרת|חוזרים|חוזרות|לחזור על|חזרה על|חזרות על|חזרתם|חזרת על/;

// Problems in one sentence of a note, by the rules the prompt states:
// English only as an exact quote from the answer, no repetition claims.
function sentenceProblems(sentence: string, transcript: string): string[] {
  const problems: string[] = [];
  for (const m of sentence.matchAll(QUOTE)) {
    if (countPhrase(transcript, m[1]) === 0) problems.push(`'${m[1]}' does not appear in the answer`);
  }
  const outside = sentence.replace(QUOTE, " ");
  const english = outside.match(/[A-Za-z][A-Za-z' -]*[A-Za-z]|[A-Za-z]/g);
  if (english) problems.push(`English outside a quote: ${english.map((e) => e.trim()).join(", ")}`);
  if (REPETITION.test(sentence)) problems.push("claims something is repeated");
  return problems;
}

export function splitSentences(note: string): string[] {
  return note.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
}

export function noteProblems(feedback: OralSetFeedback, transcript: string): Partial<Record<CriterionKey, string[]>> {
  const out: Partial<Record<CriterionKey, string[]>> = {};
  for (const { key } of CRITERIA) {
    const problems = splitSentences(feedback.notesHe[key]).flatMap((s) => sentenceProblems(s, transcript));
    if (problems.length) out[key] = problems;
  }
  return out;
}

const FALLBACK_NOTE: Record<CriterionKey, string> = {
  topic: "כדאי לענות על כל שאלה בנפרד ולהוסיף הסבר ודוגמה לכל אחת.",
  delivery: "כדאי לדבר במשפטים שלמים ולחבר ביניהם, בלי לעצור באמצע רעיון.",
  vocabulary: "כדאי לגוון את המילים ולהשתמש גם במילים שמופיעות ברשימה למטה.",
  language: "כדאי לחבר משפטים קצרים למשפטים ארוכים יותר ולבדוק את זמני הפעלים.",
};

// The last line of defence: whatever still breaks a rule is cut, sentence by
// sentence; a note left empty gets a plain, true sentence instead.
export function stripProblemSentences(feedback: OralSetFeedback, transcript: string): OralSetFeedback {
  const notesHe = { ...feedback.notesHe };
  for (const { key } of CRITERIA) {
    const kept = splitSentences(notesHe[key]).filter((s) => sentenceProblems(s, transcript).length === 0);
    notesHe[key] = kept.length ? kept.join(" ") : FALLBACK_NOTE[key];
  }
  return { ...feedback, notesHe };
}
