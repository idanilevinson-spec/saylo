import "server-only";
import type { SpeechProvider } from "../provider";

// Default until a real provider is chosen and funded — every method fails
// loudly rather than silently, so it's obvious in testing if something
// starts depending on this before it's replaced.
export const noopSpeechProvider: SpeechProvider = {
  async transcribe() {
    throw new Error("No speech provider configured yet — this ships in a later phase.");
  },
  async synthesize() {
    throw new Error("No speech provider configured yet — this ships in a later phase.");
  },
  async scorePronunciation() {
    throw new Error("No speech provider configured yet — this ships in a later phase.");
  },
};
