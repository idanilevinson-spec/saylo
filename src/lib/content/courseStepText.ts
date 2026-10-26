import { MASTERED_THRESHOLD, MIN_ATTEMPTS_FOR_MASTERY, type ResolvedStep } from "./courseProgress";
import type { CourseStepKind } from "./course";

// What finishes each kind of course step, in the learner's words, and how
// close a step in progress is. The numbers come from the rule itself
// (courseProgress.ts), so this can't drift from what actually counts.

export function stepGoal(kind: CourseStepKind): string {
  switch (kind) {
    case "vocabulary":
      return `${MASTERED_THRESHOLD}% נכונות בתרגול, על ${MIN_ATTEMPTS_FOR_MASTERY} תשובות לפחות, או שליטה בכל המילים`;
    case "grammar":
      return `${MASTERED_THRESHOLD}% נכונות בתרגול, על ${MIN_ATTEMPTS_FOR_MASTERY} תשובות לפחות`;
    case "reading":
    case "listening":
      return "תשובה לכל שאלות ההבנה";
    case "writing":
      return "חיבור אחד שנשלח למשוב";
    case "speaking":
      return "שיחה אחת עם המורה עד הסוף";
  }
}

// For a step in progress: what's been done and what's still missing.
export function stepProgressText(step: Pick<ResolvedStep, "kind" | "status" | "detail">): string | null {
  if (step.status !== "started") return null;
  const d = step.detail ?? {};
  switch (step.kind) {
    case "vocabulary":
    case "grammar": {
      const answered = d.answered ?? 0;
      const parts: string[] = [];
      if (answered > 0) {
        if (answered < MIN_ATTEMPTS_FOR_MASTERY) {
          parts.push(`עניתם על ${answered}. עוד ${MIN_ATTEMPTS_FOR_MASTERY - answered} לפחות, ב-${MASTERED_THRESHOLD}% נכונות`);
        } else {
          const pct = Math.round(((d.correct ?? 0) / answered) * 100);
          parts.push(`${pct}% נכונות על ${answered} תשובות. צריך ${MASTERED_THRESHOLD}%`);
        }
      }
      if (step.kind === "vocabulary" && (d.wordsMastered ?? 0) > 0 && (d.words ?? 0) > 0) {
        parts.push(`${d.wordsMastered} מתוך ${d.words} מילים בשליטה`);
      }
      return parts.length > 0 ? parts.join(" · ") : null;
    }
    case "reading":
    case "listening":
      return d.questions ? `עניתם על ${d.questionsAnswered ?? 0} מתוך ${d.questions} שאלות` : null;
    case "speaking":
      return "השיחה התחילה. מסיימים אותה כדי להשלים את השלב";
    default:
      return null;
  }
}
