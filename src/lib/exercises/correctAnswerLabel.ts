import type { ExerciseType } from "@/types/database";
import type { McqContent, FillBlankContent, MatchContent, ReorderContent, DictationContent } from "@/types/exercises";

// Surfaces what the right answer actually was after a wrong attempt —
// exact-match grading (fill_blank/dictation especially) means "not quite"
// alone leaves a learner with no way to know what they got wrong.
export function correctAnswerLabel(type: ExerciseType, content: Record<string, unknown>): string {
  switch (type) {
    case "mcq": {
      const c = content as unknown as McqContent;
      return c.options[c.correctIndex];
    }
    case "fill_blank": {
      const c = content as unknown as FillBlankContent;
      return c.correctAnswer;
    }
    case "match": {
      const c = content as unknown as MatchContent;
      return c.pairs.map((p) => `${p.left} = ${p.right}`).join(" · ");
    }
    case "reorder": {
      const c = content as unknown as ReorderContent;
      return c.correctOrder.map((i) => c.tokens[i]).join(" ");
    }
    case "dictation": {
      const c = content as unknown as DictationContent;
      return c.correctAnswer;
    }
  }
}
