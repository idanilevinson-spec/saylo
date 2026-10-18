// The cue that asks the teacher to open a conversation. It stands in for
// the learner's first turn (the API needs one), so it is also what a
// conversation that starts with the teacher's line is replayed with.
export const CONVERSATION_OPENER_CUE = (voice: boolean) =>
  `(The learner has just opened this conversation and hasn't said anything yet. Start it the way a good teacher would: greet them briefly and ask one easy, open first question that fits the scenario${
    voice ? ", in 1-2 short spoken sentences" : ", in 1-3 short sentences"
  }. If you remember a topic you talked about before, you may pick up from that one thing in a few words, the way a teacher who knows them would ("Last time you told me about the beach..."); never list what you remember, never mention the words they are learning or their mistakes, and never force a word into the question. Otherwise ask about their day or life, or start the scenario. Do not correct anything and do not write a correction line.)`;

// Every turn of a conversation the teacher opened is sent to the model
// with this cue in front, so the history starts with a learner turn as
// the API requires and the model sees why it spoke first.
export function withOpenerCue<T extends { role: string; content: string }>(history: T[]): (T | { role: "user"; content: string })[] {
  return history[0]?.role === "assistant" ? [{ role: "user", content: CONVERSATION_OPENER_CUE(false) }, ...history] : history;
}
