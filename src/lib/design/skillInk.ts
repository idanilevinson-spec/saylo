// The skill inks (globals.css --ink-*): which colour each practice area
// writes in, keyed by the area's route. Icons and small marks only. Class
// names are spelled out in full so Tailwind sees them.
type Ink = { text: string; dot: string };

const VOCAB: Ink = { text: "text-ink-vocab", dot: "bg-ink-vocab" };
const GRAMMAR: Ink = { text: "text-ink-grammar", dot: "bg-ink-grammar" };
const READING: Ink = { text: "text-ink-reading", dot: "bg-ink-reading" };
const LISTENING: Ink = { text: "text-ink-listening", dot: "bg-ink-listening" };
const WRITING: Ink = { text: "text-ink-writing", dot: "bg-ink-writing" };
const SPEAKING: Ink = { text: "text-ink-speaking", dot: "bg-ink-speaking" };
const PLAIN: Ink = { text: "text-primary-hover", dot: "bg-primary" };

const INK: Record<string, Ink> = {
  "/vocabulary": VOCAB,
  "/games": VOCAB,
  "/review": VOCAB,
  "/mistakes": VOCAB,
  "/grammar": GRAMMAR,
  "/reading": READING,
  "/bagrut": READING,
  "/listening": LISTENING,
  "/writing": WRITING,
  "/idioms": WRITING,
  "/speaking": SPEAKING,
  "/speaking/voice": SPEAKING,
  "/speaking-test": SPEAKING,
};

export function skillInk(href: string): Ink {
  return INK[href] ?? PLAIN;
}
