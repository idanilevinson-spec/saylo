// "What do I even say?" is the moment a learner closes the app. Instead of
// answering for them, the teacher offers three ways to answer the last
// question, from a short safe one to a richer one, each with its meaning
// in Hebrew. The learner picks one, edits it and sends it themselves, so
// they still produce the English.

export interface ReplyIdea {
  en: string;
  he: string;
}

export function buildReplyIdeasPrompt(level: string | null): string {
  return `You help a Hebrew-speaking English learner${level ? ` (CEFR level ${level})` : ""} who is stuck in a conversation with their English teacher and doesn't know what to answer.
Read the conversation and write exactly three different answers the learner could give to the teacher's last message (or, if nothing has been said yet, three ways to open the conversation), in the learner's voice (first person), as natural spoken English:
1. A short, easy answer (one simple sentence${level && /^A/.test(level) ? ", A1-A2 words only" : ""}).
2. A fuller answer: one or two sentences with a reason or a detail.
3. A richer answer that uses one useful phrase or word a step above their level.
The three must take different directions (for example yes / no / it depends, or different details), so the learner can choose what is true for them. Never invent facts about the learner's real life beyond simple, common examples, and keep everything suitable for any age.
For each answer add its translation into short, natural Hebrew, the way a good textbook glosses a sentence: faithful to the English, first person ("I agree" is "אני מסכים/ה", never "מסכימים"), and fluent, never twisted to dodge grammar. The learner's gender is unknown, so when a Hebrew word must show gender (an adjective or a present-tense verb about the learner), write it with a slash, masculine first: "אני עייף/ה", "אני מרגיש/ה", "שמח/ה". Use the slash only where Hebrew truly needs it.
Hebrew style: plain and short, no long dash (—), no stock phrases.
Reply with raw JSON only, no markdown, in exactly this shape:
{"ideas":[{"en":"...","he":"..."},{"en":"...","he":"..."},{"en":"...","he":"..."}]}`;
}

const LATIN = /[A-Za-z]/;

// Takes the model's already-parsed JSON and keeps only usable ideas.
export function cleanReplyIdeas(parsed: { ideas?: unknown } | null): ReplyIdea[] {
  if (!parsed || !Array.isArray(parsed.ideas)) return [];
  const clean = (s: string) => s.replace(/\s*—\s*/g, ", ").replace(/\*\*/g, "").trim();
  return parsed.ideas
    .filter((i): i is ReplyIdea => !!i && typeof (i as ReplyIdea).en === "string" && typeof (i as ReplyIdea).he === "string")
    .map((i) => ({ en: clean(i.en), he: clean(i.he) }))
    .filter((i) => LATIN.test(i.en) && i.en.length <= 300)
    .slice(0, 3);
}
