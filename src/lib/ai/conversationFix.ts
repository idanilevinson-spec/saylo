// The teacher marks a correction with one machine-readable line at the end
// of its reply (see CORRECTION_NOTE in prompts/conversationPartner.ts). The
// app shows it as a card under the learner's message, so the fix stays on
// screen after the spoken reply is gone; the line itself is never shown,
// stored in the reply text, or read aloud.

export const FIX_MARKER = "FIX:";

export interface ConversationFix {
  original: string;
  better: string;
  why: string;
}

const LINE = new RegExp(`^\\s*${FIX_MARKER}\\s*(\\{.*\\})\\s*$`);

function asFix(value: unknown): ConversationFix | null {
  if (!value || typeof value !== "object") return null;
  const { original, better, why } = value as Record<string, unknown>;
  if (typeof original !== "string" || typeof better !== "string") return null;
  const o = original.trim();
  const b = better.trim();
  // A "fix" that changes nothing is the invented correction this exists to
  // stop; drop it rather than show it.
  if (!o || !b || o.toLowerCase() === b.toLowerCase()) return null;
  return { original: o, better: b, why: typeof why === "string" ? why.trim() : "" };
}

// Splits a raw model reply into what the learner sees and hears, and the
// correction (if any). Every FIX line is removed from the text, even a
// malformed one, so the marker can never be read aloud.
export function splitConversationReply(raw: string): { reply: string; fix: ConversationFix | null } {
  let fix: ConversationFix | null = null;
  const kept: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim().startsWith(FIX_MARKER)) {
      kept.push(line);
      continue;
    }
    const m = line.match(LINE);
    if (m && !fix) {
      try {
        fix = asFix(JSON.parse(m[1]));
      } catch {
        // malformed: dropped from the text, not shown
      }
    }
  }
  return { reply: tidy(kept.join("\n")), fix };
}

// Belt and braces for what the prompt already asks: no markdown bold (it
// would show as asterisks and could be read out) and no long dash.
function tidy(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\s*—\s*/g, ", ")
    .trim();
}
