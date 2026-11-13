import { PART_A_TOPICS, PART_B_SETS, PART_C_PASSAGES, type PartCPassage } from "@/lib/content/bagrutOral";
import { CRITERIA, type CriterionKey, type OralPart } from "./oralRules";

// Finds a question set by id. The grading route takes only the id from the
// browser and reads the questions here, so a request can't swap in its own
// "questions" (or instructions) for the AI.
export interface ResolvedSet {
  part: OralPart;
  questions: string[];
  passage: PartCPassage | null;
}

export function resolveSet(setId: string): ResolvedSet | null {
  const a = PART_A_TOPICS.find((t) => t.id === setId);
  if (a) return { part: "A", questions: a.questions, passage: null };
  const b = PART_B_SETS.find((s) => s.id === setId);
  if (b) return { part: "B", questions: b.questions, passage: null };
  for (const p of PART_C_PASSAGES) {
    const c = p.sets.find((s) => s.id === setId);
    if (c) return { part: "C", questions: c.questions, passage: p };
  }
  return null;
}

// What the grader must return for one set, checked before anything reaches
// the learner: every score a whole number 0-100, every note present, the
// missed questions real indexes. Anything off → null (the route reports a
// failed grade instead of showing a made-up one).
export interface OralSetFeedback {
  scores: Record<CriterionKey, number>;
  notesHe: Record<CriterionKey, string>;
  missedQuestions: number[];
  nextLevelAnswer: string;
  patterns: { said: string; better: string; whyHe: string }[];
}

const MAX_NOTE = 400;
const MAX_ANSWER = 1500;

export function parseOralFeedback(raw: unknown, questionCount: number): OralSetFeedback | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const scoresIn = r.scores as Record<string, unknown> | undefined;
  const notesIn = r.notesHe as Record<string, unknown> | undefined;
  if (!scoresIn || !notesIn) return null;

  const scores = {} as Record<CriterionKey, number>;
  const notesHe = {} as Record<CriterionKey, string>;
  for (const { key } of CRITERIA) {
    const s = scoresIn[key];
    const n = notesIn[key];
    if (typeof s !== "number" || !Number.isFinite(s) || typeof n !== "string" || !n.trim()) return null;
    scores[key] = Math.round(Math.min(100, Math.max(0, s)));
    notesHe[key] = n.trim().slice(0, MAX_NOTE);
  }

  const missedQuestions = Array.isArray(r.missedQuestions)
    ? [...new Set(r.missedQuestions.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < questionCount))].sort()
    : [];
  const nextLevelAnswer = typeof r.nextLevelAnswer === "string" ? r.nextLevelAnswer.trim().slice(0, MAX_ANSWER) : "";
  if (!nextLevelAnswer) return null;

  const patterns = Array.isArray(r.patterns)
    ? r.patterns
        .filter(
          (p): p is { said: string; better: string; whyHe: string } =>
            !!p &&
            typeof p === "object" &&
            typeof (p as Record<string, unknown>).said === "string" &&
            typeof (p as Record<string, unknown>).better === "string" &&
            typeof (p as Record<string, unknown>).whyHe === "string",
        )
        .map((p) => ({ said: p.said.trim().slice(0, 120), better: p.better.trim().slice(0, 120), whyHe: p.whyHe.trim().slice(0, 300) }))
        .filter((p) => p.said && p.better && p.whyHe && p.said !== p.better)
        .slice(0, 3)
    : [];

  return { scores, notesHe, missedQuestions, nextLevelAnswer, patterns };
}
