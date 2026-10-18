import { cleanWordMeaning, isStorableMeaning, type WordMeaning } from "@/lib/ai/prompts/wordLookup";

// The words and expressions from a conversation worth taking away: a few
// the teacher used that the learner can use next time, or that the learner
// was missing. Picked by the scoring call (it reads the whole transcript
// anyway), each with what it needs to go straight into reviews.

export interface UsefulPhrase extends WordMeaning {
  // The sentence from the conversation it appeared in, or a short natural
  // example when it was something the learner was missing.
  example: string;
}

export const USEFUL_PHRASES_INSTRUCTIONS = `"usefulPhrases": up to 5 English words or expressions from THIS conversation that are genuinely worth learning for this student: ones the AI partner used that are a step above the student's level, or ones the student clearly needed and didn't have. Prefer useful multi-word expressions and collocations ("make a decision", "look forward to") over single words. Never include anything the student themselves wrote, and nothing obviously below their level (no "beach" or "work in a bank" for a student who already uses them). Fewer good items beat filler: give 2 if only 2 are worth it. For each give:
  "en": its dictionary form in lower case, verbs without "to" ("make a move", not "to make a move"),
  "he": its meaning in short Hebrew (1-4 words, dictionary style; masculine form where Hebrew must show gender),
  "pos": "noun" | "verb" | "adjective" | "adverb" | "phrase",
  "level": its CEFR level (A1-C2),
  "distractors": three other real English words or expressions of the same kind and a similar level, each clearly different in meaning, for a multiple-choice question "which English word means <the Hebrew>?",
  "example": one complete, natural sentence using it, starting with a capital letter: the full sentence from the conversation where it appeared, copied exactly; if there it was only part of a longer message, quote only the sentence it is in; for one the student was missing, write a short natural sentence. Never a fragment or a quote inside a quote.
Use an empty array if the conversation is too short to pick anything real.`;

export function cleanUsefulPhrases(raw: unknown): UsefulPhrase[] {
  if (!Array.isArray(raw)) return [];
  const out: UsefulPhrase[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const p = item as Record<string, unknown>;
    // "to make a move" -> "make a move"; an idiom like "to be honest" keeps it.
    const en = typeof p.en === "string" && p.pos === "verb" ? p.en.replace(/^\s*to\s+(?=\w)/i, "") : p.en;
    const meaning = cleanWordMeaning({ lemma: en, he: p.he, pos: p.pos, level: p.level, distractors: p.distractors });
    const example = typeof p.example === "string" ? p.example.trim().slice(0, 300) : "";
    // A sentence quoting a correction ('It's "it was very crowded".') teaches nothing.
    if (/["“”]/.test(example)) continue;
    if (!meaning || !isStorableMeaning(meaning) || !example) continue;
    if (out.some((o) => o.lemma === meaning.lemma)) continue;
    out.push({ ...meaning, example });
  }
  return out.slice(0, 5);
}
