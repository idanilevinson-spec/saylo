import type { ExerciseType } from "@/types/database";
import type {
  McqContent,
  FillBlankContent,
  MatchContent,
  ReorderContent,
  DictationContent,
  McqResponse,
  FillBlankResponse,
  MatchResponse,
  ReorderResponse,
  DictationResponse,
} from "@/types/exercises";

export function gradeExercise(
  type: ExerciseType,
  content: Record<string, unknown>,
  response: Record<string, unknown>
): boolean {
  switch (type) {
    case "mcq": {
      const c = content as unknown as McqContent;
      const r = response as unknown as McqResponse;
      return r.selectedIndex === c.correctIndex;
    }
    case "fill_blank": {
      const c = content as unknown as FillBlankContent;
      const r = response as unknown as FillBlankResponse;
      return normalize(r.text) === normalize(c.correctAnswer);
    }
    case "match": {
      const c = content as unknown as MatchContent;
      const r = response as unknown as MatchResponse;
      if (r.pairs.length !== c.pairs.length) return false;
      return c.pairs.every((pair) =>
        r.pairs.some((rp) => rp.left === pair.left && rp.right === pair.right)
      );
    }
    case "reorder": {
      const c = content as unknown as ReorderContent;
      const r = response as unknown as ReorderResponse;
      return (
        r.order.length === c.correctOrder.length &&
        r.order.every((val, i) => val === c.correctOrder[i])
      );
    }
    case "dictation": {
      const c = content as unknown as DictationContent;
      const r = response as unknown as DictationResponse;
      return normalize(r.text) === normalize(c.correctAnswer);
    }
  }
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}
