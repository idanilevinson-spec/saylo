import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildConversationSystemPrompt } from "@/lib/ai/prompts/conversationPartner";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPaidServer } from "@/lib/subscriptions/requirePremium";
import { hasParentalClearance } from "@/lib/auth/consentServer";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasAiConsent(user)) {
    return NextResponse.json({ error: AI_CONSENT_REQUIRED_ERROR }, { status: 403 });
  }
  // Both gates must pass before anything else is touched, but neither needs
  // the other's answer — one round trip instead of two. Paid status is still
  // reported first when both fail.
  const [paid, cleared] = await Promise.all([isPaidServer(supabase, user.id), hasParentalClearance(supabase, user.id)]);
  if (!paid) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }
  if (!cleared) {
    return NextResponse.json({ error: "parental consent required" }, { status: 403 });
  }

  const { conversationId, message, voiceMode } = (await request.json()) as {
    conversationId?: string;
    message?: string;
    voiceMode?: boolean;
  };
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: "missing conversationId or message" }, { status: 400 });
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, conversation_scenarios(system_prompt)")
    .eq("id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (conversation.status !== "active") {
    return NextResponse.json({ error: "conversation already completed" }, { status: 400 });
  }

  const scenarioPrompt =
    (conversation.conversation_scenarios as unknown as { system_prompt: string } | null)?.system_prompt ?? null;

  // The conversation is confirmed to be this user's, so the remaining reads
  // are independent of each other and share one round trip. History is read
  // before the new message is stored; the message is appended by hand below.
  const [{ data: priorMessages }, { data: latestPlacement }] = await Promise.all([
    supabase
      .from("conversation_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at"),
    supabase
      .from("placement_tests")
      .select("result_cefr_overall")
      .eq("profile_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const history = [...(priorMessages ?? []), { role: "user", content: message }];

  // Stored while Claude is thinking rather than before it: the reply is what
  // the learner is waiting for, and this write doesn't feed into it.
  const userMessageStored = Promise.resolve(
    supabase.from("conversation_messages").insert({ conversation_id: conversationId, role: "user", content: message })
  );

  // Voice calls are read aloud turn-by-turn, so a web search's round-trip
  // (up to two, per the tool's max_uses) is what turns a snappy back-and-forth
  // into a laggy one — text chat keeps the tool since a few extra seconds is
  // invisible there.
  const claudeMessage = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 550,
    // thinking disabled: on by default, and eats into both the token
    // budget (risking a truncated reply at only 550 tokens) and latency —
    // the latter matters most for voice turns, which are read aloud
    // turn-by-turn and already had a separate latency fix (skipping web
    // search). See conversation-score route for how the truncation risk
    // was diagnosed.
    thinking: { type: "disabled" },
    system: buildConversationSystemPrompt(scenarioPrompt, latestPlacement?.result_cefr_overall ?? null, !voiceMode),
    ...(voiceMode ? {} : { tools: [{ type: "web_search_20260318" as const, name: "web_search", max_uses: 2 }] }),
    messages: history.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  });
  const reply = extractText(claudeMessage);

  // Both writes are independent; the user's message goes first only in the
  // sense that it was already started, so created_at ordering is unchanged.
  await userMessageStored;
  await Promise.all([
    supabase.from("conversation_messages").insert({ conversation_id: conversationId, role: "assistant", content: reply }),
    logAiUsage(
      supabase,
      user.id,
      "conversation_turn",
      claudeMessage.usage.input_tokens,
      claudeMessage.usage.output_tokens,
      claudeMessage.usage.server_tool_use?.web_search_requests ?? 0
    ),
  ]);

  return NextResponse.json({ reply });
}
