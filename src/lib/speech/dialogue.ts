// Listening transcripts can be written as a dialogue, one turn per line:
//
//   A: Hi, are you free tomorrow?
//   B: Let me check.
//
// Each speaker then gets their own voice, in one synthesis call (SSML with a
// <voice> per turn), so the turns follow each other with natural timing
// instead of a pause while the next line is fetched. A transcript without
// "A:"/"B:" lines is a monologue and is read as before.

import { NEURAL_VOICE } from "./voicePref";

export interface DialogueTurn {
  speaker: "A" | "B" | null;
  text: string;
}

const TURN = /^\s*([AB]):\s*(.+?)\s*$/;

export function parseDialogue(transcript: string): DialogueTurn[] {
  const lines = transcript.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2 || !lines.every((l) => TURN.test(l))) return [{ speaker: null, text: transcript.trim() }];
  return lines.map((l) => {
    const [, speaker, text] = l.match(TURN)!;
    return { speaker: speaker as "A" | "B", text };
  });
}

// The words alone, for the browser's built-in voice and for word counts.
export function spokenText(transcript: string): string {
  return parseDialogue(transcript)
    .map((t) => t.text)
    .join(" ");
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// A woman's voice for A and a man's for B, so the two are easy to tell
// apart whatever the learner picked as the tutor's voice.
export const DIALOGUE_VOICES = { A: NEURAL_VOICE.female, B: NEURAL_VOICE.male } as const;

export function dialogueSsml(turns: DialogueTurn[]): string {
  const body = turns
    .map((t) => `<voice name="${DIALOGUE_VOICES[t.speaker ?? "A"]}">${escapeXml(t.text)}<break time="250ms"/></voice>`)
    .join("");
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">${body}</speak>`;
}
