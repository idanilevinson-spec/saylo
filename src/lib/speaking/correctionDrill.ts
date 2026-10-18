import { normalizeAnswer } from "@/lib/exercises/grade";
import type { ConversationFix } from "@/lib/ai/conversationFix";

// Checks for the after-conversation corrections drill (CorrectionsPractice).

// "I went to the beach... we ate ice cream": the teacher shortens long
// sentences with "...", which nobody types back.
const comparable = (s: string) => normalizeAnswer(s.replace(/\.{3}|…/g, " "));

// The corrected sentence as something to say out loud: the teacher's "..."
// between two parts becomes a comma.
export function sayableFix(better: string): string {
  return better.replace(/\s*(\.{3}|…)\s*/g, ", ").trim();
}

export function isCorrectRewrite(answer: string, fix: ConversationFix): boolean {
  // The fix is often a fragment ("I went to the beach") and the learner
  // writes the whole sentence ("Yesterday I went to the beach"): right if
  // the corrected words are all there, in order.
  const given = ` ${comparable(answer)} `;
  return given.includes(` ${comparable(fix.better)} `);
}
