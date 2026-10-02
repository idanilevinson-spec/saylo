import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { logAiUsage } from "@/lib/ai/usageLog";
import { runSupportAgent, type AgentEvent } from "@/lib/support/agent";
import { buildSupportContext } from "@/lib/support/systemPrompt";
import { readAccountStatus } from "@/lib/support/tools";
import { redactSensitiveNumbers } from "@/lib/support/redact";
import { clientIp, ownerKey, supportHash, VISITOR_TOKEN_PATTERN } from "@/lib/support/identity";
import { consumeRateLimit, SUPPORT_LIMITS } from "@/lib/support/rateLimit";
import { SUPPORT_MAX_MESSAGE_LENGTH } from "@/lib/support/topics";

// A normal answer takes a few seconds; one with an account lookup and a
// fallback re-run can take longer. Well under the platform ceiling.
export const maxDuration = 60;

// How much earlier conversation is sent back to the model each turn.
const HISTORY_LIMIT = 30;

const Body = z.object({
  conversationId: z.uuid().nullish(),
  visitorToken: z.string().regex(VISITOR_TOKEN_PATTERN),
  message: z.string().trim().min(1).max(SUPPORT_MAX_MESSAGE_LENGTH),
  pagePath: z.string().max(200).startsWith("/").nullish(),
  isNativeApp: z.boolean().optional(),
  // The widget only sends a message after the person agreed to the notice
  // about AI and data; the server records when.
  consent: z.literal(true),
});

// The response is a stream of newline-delimited JSON events:
//   {type:"conversation", id}   once, first
//   {type:"text", delta}        as the answer is written
//   {type:"status", label}      while a tool runs ("בודק את פרטי החשבון…")
//   {type:"callback_form", topic}  show the contact form under the answer
//   {type:"replace", text}      discard what streamed, show this instead
//   {type:"done", messageId}    the answer was saved; id is for 👍/👎
//   {type:"error", code}        the answer failed part-way
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { conversationId, visitorToken, pagePath, isNativeApp } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Explicit element type — without it, TypeScript narrows `limit` to the
  // literal 60 from this first entry (SUPPORT_LIMITS is `as const`), and the
  // push() below (limit: 80) fails to typecheck against that literal.
  const limits: { hash: string; limit: number }[] = [
    { hash: supportHash("ip", clientIp(request)), limit: SUPPORT_LIMITS.messagesPerIp },
  ];
  if (user) limits.push({ hash: supportHash("profile", user.id), limit: SUPPORT_LIMITS.messagesPerProfile });
  if (!(await consumeRateLimit(limits, "message"))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const ownerKeyHash = ownerKey(user?.id ?? null, visitorToken);
  let conversation: { id: string; message_count: number } | null = null;
  if (conversationId) {
    const { data } = await supabaseAdmin
      .from("support_conversations")
      .select("id, message_count")
      .eq("id", conversationId)
      .eq("owner_key_hash", ownerKeyHash)
      .maybeSingle();
    // An id that isn't this caller's (or was purged) just starts a new chat
    // rather than failing — the widget then adopts the new id.
    conversation = data;
  }
  if (conversation && conversation.message_count >= SUPPORT_LIMITS.userMessagesPerConversation * 2) {
    return NextResponse.json({ error: "conversation_limit" }, { status: 429 });
  }
  if (!conversation) {
    const { data, error } = await supabaseAdmin
      .from("support_conversations")
      .insert({
        profile_id: user?.id ?? null,
        owner_key_hash: ownerKeyHash,
        page_path: pagePath ?? null,
        consented_at: new Date().toISOString(),
      })
      .select("id, message_count")
      .single();
    if (error || !data) return NextResponse.json({ error: "server_error" }, { status: 500 });
    conversation = data;
  }
  const convId = conversation.id;

  const { text: message, redacted } = redactSensitiveNumbers(parsed.data.message);

  const [{ data: prior }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from("support_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    user
      ? supabase.from("profiles").select("age_band").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null as { age_band: string } | null }),
  ]);

  // Stored before the answer, so the transcript has the question even if
  // the answer fails part-way.
  await supabaseAdmin.from("support_messages").insert({ conversation_id: convId, role: "user", content: message });

  // History is replayed as plain text turns. Earlier turns' tool calls and
  // thinking aren't kept — the text of each answer is what matters for
  // continuity, and it keeps every request append-only and cheap.
  const history: Anthropic.Beta.BetaMessageParam[] = [
    ...(prior ?? []).reverse().map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
    {
      role: "user",
      content: redacted
        ? `${message}\n\n(Note from the system: a card or ID number in this message was removed before you saw it.)`
        : message,
    },
  ];
  // The model needs the history to start with the person; a transcript
  // trimmed to the last N turns can begin with an answer.
  while (history.length > 1 && history[0].role === "assistant") history.shift();

  const context = buildSupportContext({
    pagePath: pagePath ?? null,
    signedIn: !!user,
    isMinor: !!profile && profile.age_band !== "adult",
    isNativeApp: !!isNativeApp,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      send({ type: "conversation", id: convId });

      try {
        const result = await runSupportAgent({
          history,
          context,
          readAccountStatus: user ? () => readAccountStatus(supabase, user) : null,
          emit: (event: AgentEvent) => send(event),
          signal: request.signal,
        });

        const reply =
          result.text ||
          (result.handoff ? "" : "לא הצלחתי לנסח תשובה. אפשר לנסות לשאול שוב במילים אחרות, או להשאיר פרטים ונחזור אליכם.");
        if (result.refused || !result.text) send({ type: "replace", text: reply });

        const [{ data: saved }] = await Promise.all([
          supabaseAdmin
            .from("support_messages")
            .insert({
              conversation_id: convId,
              role: "assistant",
              content: reply || "(נפתח טופס השארת פרטים)",
              input_tokens: result.inputTokens,
              output_tokens: result.outputTokens,
            })
            .select("id")
            .single(),
          supabaseAdmin
            .from("support_conversations")
            .update({
              message_count: conversation.message_count + 2,
              last_message_at: new Date().toISOString(),
              ...(result.handoff ? { handoff_topic: result.handoff.topic, handoff_summary: result.handoff.summary } : {}),
            })
            .eq("id", convId),
          user
            ? logAiUsage(supabase, user.id, "support_chat", result.inputTokens, result.outputTokens)
            : Promise.resolve(),
        ]);
        send({ type: "done", messageId: saved?.id ?? null });
      } catch (error) {
        // The person closed the chat mid-answer: nothing to report back.
        if (request.signal.aborted) {
          controller.close();
          return;
        }
        console.error("support chat failed", error);
        send({
          type: "error",
          code: error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError ? "busy" : "failed",
        });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      // Stops proxies from buffering the stream into one late chunk.
      "X-Accel-Buffering": "no",
    },
  });
}
