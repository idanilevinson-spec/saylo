import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing ANTHROPIC_API_KEY. Add it to .env.local — see .env.local.example. Get a key at https://console.anthropic.com."
  );
}

export const anthropic = new Anthropic({ apiKey });

export const CLAUDE_MODEL = "claude-sonnet-5";

// With tool use (e.g. web search) a reply can carry multiple text blocks
// interleaved with tool_use/tool_result blocks — join all of them instead of
// taking just the first, which would truncate a reply that searched first.
export function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");
}

// Every JSON-response prompt in this codebase tells the model to reply
// with raw JSON and no markdown code fences, but that instruction isn't
// reliably followed — the model sometimes wraps its (otherwise valid)
// JSON in a ```json ... ``` block anyway. Stripping a fence before
// parsing, rather than only trusting the instruction, is what makes
// parsing actually robust instead of failing on a coin flip.
export function parseJsonResponse<T>(raw: string): T | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
