import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/ai/claudeClient";
import { SUPPORT_SYSTEM_PROMPT } from "./systemPrompt";
import { CallbackFormInput, GET_ACCOUNT_STATUS, OFFER_CALLBACK_FORM, SUPPORT_TOOLS } from "./tools";
import type { SupportTopic } from "./topics";

// The support assistant's agent loop: one call to Claude, and if it asks for
// a tool, run the tool, hand the result back, and let it continue — until it
// has answered. Streams text to the caller as it is written.
//
// Why the current Opus at low effort rather than a smaller model: a support
// answer is short, so the per-message cost is dominated by the (cached)
// knowledge base, and the bigger model is noticeably better at the part
// that matters here — knowing when it *doesn't* know and handing off instead
// of improvising. Low effort keeps it quick; it rarely needs to think long.
export const SUPPORT_MODEL = "claude-opus-5-5";

// Two tool rounds cover every real flow (check the account, then maybe open
// the form); the extra headroom is only so a stray retry can't loop forever.
const MAX_ROUNDS = 4;

export type AgentEvent =
  | { type: "text"; delta: string }
  | { type: "status"; label: string }
  | { type: "callback_form"; topic: SupportTopic };

export interface AgentResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  handoff: { topic: SupportTopic; summary: string } | null;
  refused: boolean;
}

interface RunOptions {
  history: Anthropic.Beta.BetaMessageParam[];
  context: string;
  readAccountStatus: (() => Promise<unknown>) | null;
  emit: (event: AgentEvent) => void;
  signal?: AbortSignal;
}

const REFUSAL_REPLY = "על זה אני לא יכול לעזור כאן. אם זה קשור ל-Saylo, אפשר להשאיר פרטים ומישהו מהצוות יחזור אליכם.";

export async function runSupportAgent({ history, context, readAccountStatus, emit, signal }: RunOptions): Promise<AgentResult> {
  const messages = [...history];
  let text = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let handoff: AgentResult["handoff"] = null;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const stream = anthropic.beta.messages.stream(
      {
        model: SUPPORT_MODEL,
        max_tokens: 2048,
        // A safety classifier can decline a request; "default" re-runs it on
        // Anthropic's recommended fallback model instead of failing the turn.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        // Order matters for caching: tools, then the big frozen prompt (the
        // cache breakpoint), then the small per-request context after it.
        // Tool definitions are identical for everyone — even signed-out
        // visitors get get_account_status (it just answers "not signed in")
        // — because a different tool list would be a different cache.
        tools: SUPPORT_TOOLS,
        system: [
          { type: "text", text: SUPPORT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
          { type: "text", text: context },
        ],
        messages,
      },
      { signal }
    );

    // A paragraph break between rounds, so text written before a tool call
    // and the answer after it don't run together.
    let roundStarted = false;
    stream.on("text", (delta) => {
      if (!roundStarted && text) {
        text += "\n\n";
        emit({ type: "text", delta: "\n\n" });
      }
      roundStarted = true;
      text += delta;
      emit({ type: "text", delta });
    });

    const message = await stream.finalMessage();
    inputTokens += message.usage.input_tokens + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.cache_creation_input_tokens ?? 0);
    outputTokens += message.usage.output_tokens;

    if (message.stop_reason === "refusal") {
      // Whatever streamed before the decline is discarded by the client
      // when it sees the replacement; only the polite reply is stored.
      return { text: REFUSAL_REPLY, inputTokens, outputTokens, handoff, refused: true };
    }

    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    // max_tokens with a tool call means the call may be cut off — don't run
    // it on partial input. Without one, it's just a long answer; keep it.
    if (toolUses.length === 0 || message.stop_reason !== "tool_use") break;

    messages.push({ role: "assistant", content: message.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];

    for (const call of toolUses) {
      if (call.name === GET_ACCOUNT_STATUS) {
        if (!readAccountStatus) {
          results.push({ type: "tool_result", tool_use_id: call.id, is_error: true, content: "The person is not signed in." });
          continue;
        }
        emit({ type: "status", label: "בודק את פרטי החשבון…" });
        try {
          results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(await readAccountStatus()) });
        } catch {
          results.push({ type: "tool_result", tool_use_id: call.id, is_error: true, content: "Account status is temporarily unavailable." });
        }
      } else if (call.name === OFFER_CALLBACK_FORM) {
        const parsed = CallbackFormInput.safeParse(call.input);
        if (!parsed.success) {
          results.push({ type: "tool_result", tool_use_id: call.id, is_error: true, content: "Invalid input: topic and summary are required." });
          continue;
        }
        handoff = parsed.data;
        emit({ type: "callback_form", topic: parsed.data.topic });
        results.push({
          type: "tool_result",
          tool_use_id: call.id,
          content:
            "The form is now displayed right under your message. Don't describe it, point to it, or ask for contact details. If you already told the person a form is coming, write nothing more; otherwise add one short sentence at most.",
        });
      } else {
        results.push({ type: "tool_result", tool_use_id: call.id, is_error: true, content: `Unknown tool ${call.name}.` });
      }
    }

    messages.push({ role: "user", content: results });
  }

  return { text: text.trim(), inputTokens, outputTokens, handoff, refused: false };
}
