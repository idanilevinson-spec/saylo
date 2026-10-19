import { withOpenerCue } from "@/lib/ai/prompts/conversationOpener";

// What one conversation turn may cost. A learner message is a few dozen
// characters (median 29, 99% under 350 when measured), so 1500 only stops
// pasted walls of text. And every turn resends the conversation so far, so
// a long one grew dearer with each message; the last 40 messages (20
// exchanges) keep the thread, and long-term memory is fed in separately.
export const MAX_MESSAGE_CHARS = 1500;
export const MAX_MESSAGES_SENT = 40;

type Turn = { role: string; content: string };

export function historyForModel<T extends Turn>(history: T[]): (T | { role: "user"; content: string })[] {
  if (history.length <= MAX_MESSAGES_SENT) return withOpenerCue(history);
  // Cut, then start on a learner turn as the API requires.
  let recent = history.slice(-MAX_MESSAGES_SENT);
  const firstUser = recent.findIndex((m) => m.role === "user");
  recent = firstUser > 0 ? recent.slice(firstUser) : recent;
  return recent;
}
