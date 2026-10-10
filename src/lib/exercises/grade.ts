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

// Typed answers are compared after normalizing both sides the same way, so
// that only the English counts, not how it was keyed in:
// - curly apostrophes and quotes (the iPhone keyboard's default) count as
//   straight ones: "isn’t" is "isn't";
// - short and long forms are equal: "isn't" = "is not", "can't" = "cannot",
//   "there's" = "there is", "I'm" = "I am";
// - punctuation is ignored: in a dictation "Can I have a coffee please" is
//   right even without the comma and the question mark.
// 's after a name ("Noa's") and 'd (had or would?) are left alone.
export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\bwon't\b/g, "will not")
    .replace(/\bcan't\b/g, "can not")
    .replace(/\bcannot\b/g, "can not")
    .replace(/\bshan't\b/g, "shall not")
    .replace(/n't\b/g, " not")
    .replace(/'re\b/g, " are")
    .replace(/'ve\b/g, " have")
    .replace(/'ll\b/g, " will")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\b(it|that|there|here|he|she|what|where|who|how)'s\b/g, "$1 is")
    .replace(/[.,!?;:"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const normalize = normalizeAnswer;
