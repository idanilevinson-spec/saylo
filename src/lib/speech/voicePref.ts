// Shared between the voice call panel and the text chat page so the AI
// tutor's face and voice always agree — picking a voice also picks which
// illustrated teacher shows up in chat bubbles.
export type VoicePref = "female" | "male";

// Azure neural voices — used anywhere in the app that speaks English text
// aloud with a real (non-robotic) accent: AI voice calls, and reading-
// passage narration for learners who struggle to read on their own.
export const NEURAL_VOICE: Record<VoicePref, string> = {
  female: "en-US-JennyNeural",
  male: "en-US-GuyNeural",
};

const STORAGE_KEY = "voiceConversationPref";

export function loadVoicePref(): VoicePref {
  if (typeof window === "undefined") return "female";
  return localStorage.getItem(STORAGE_KEY) === "male" ? "male" : "female";
}

export function saveVoicePref(pref: VoicePref): void {
  localStorage.setItem(STORAGE_KEY, pref);
}
