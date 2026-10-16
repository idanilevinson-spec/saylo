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

// The AI teacher on a voice call. Multilingual voices, because the teacher
// now answers a Hebrew question with a few Hebrew words ("in Hebrew you say
// קבלה, in English it's a receipt") and the English-only voices can't say
// them. Same gender as NEURAL_VOICE, so the avatar still matches.
export const CONVERSATION_VOICE: Record<VoicePref, string> = {
  female: "en-US-AvaMultilingualNeural",
  male: "en-US-AndrewMultilingualNeural",
};

const STORAGE_KEY = "voiceConversationPref";

export function loadVoicePref(): VoicePref {
  if (typeof window === "undefined") return "female";
  return localStorage.getItem(STORAGE_KEY) === "male" ? "male" : "female";
}

export function saveVoicePref(pref: VoicePref): void {
  localStorage.setItem(STORAGE_KEY, pref);
}
