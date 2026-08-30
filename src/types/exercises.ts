import { z } from "zod";

// Postgres can't enforce the shape of exercises.content (jsonb), so every
// write path (seed scripts, future admin CMS) should validate through this
// schema before insert/update.

export const McqContentSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().nonnegative(),
});

export const FillBlankContentSchema = z.object({
  sentence: z.string(),
  correctAnswer: z.string(),
  hint: z.string().optional(),
});

export const MatchContentSchema = z.object({
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(2),
});

export const ReorderContentSchema = z.object({
  tokens: z.array(z.string()).min(2),
  correctOrder: z.array(z.number().int().nonnegative()),
});

export const DictationContentSchema = z.object({
  audioText: z.string(),
  correctAnswer: z.string(),
});

export const ExerciseContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("mcq"), content: McqContentSchema }),
  z.object({ type: z.literal("fill_blank"), content: FillBlankContentSchema }),
  z.object({ type: z.literal("match"), content: MatchContentSchema }),
  z.object({ type: z.literal("reorder"), content: ReorderContentSchema }),
  z.object({ type: z.literal("dictation"), content: DictationContentSchema }),
]);

export type McqContent = z.infer<typeof McqContentSchema>;
export type FillBlankContent = z.infer<typeof FillBlankContentSchema>;
export type MatchContent = z.infer<typeof MatchContentSchema>;
export type ReorderContent = z.infer<typeof ReorderContentSchema>;
export type DictationContent = z.infer<typeof DictationContentSchema>;

export type ExerciseContent = McqContent | FillBlankContent | MatchContent | ReorderContent | DictationContent;

// Response shapes the exercise player records into exercise_attempts.response
export type McqResponse = { selectedIndex: number };
export type FillBlankResponse = { text: string };
export type MatchResponse = { pairs: { left: string; right: string }[] };
export type ReorderResponse = { order: number[] };
export type DictationResponse = { text: string };
