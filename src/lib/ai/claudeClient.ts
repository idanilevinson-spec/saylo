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
