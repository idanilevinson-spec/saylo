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

export function extractText(message: Anthropic.Message): string {
  const block = message.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}
