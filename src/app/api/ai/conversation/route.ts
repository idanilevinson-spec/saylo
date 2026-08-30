import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildConversationSystemPrompt } from "@/lib/ai/prompts/conversationPartner";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { conversationId, message } = (await request.json()) as {
    conversationId?: string;
    message?: string;
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

  await supabase
    .from("conversation_messages")
    .insert({ conversation_id: conversationId, role: "user", content: message });

  const { data: history } = await supabase
    .from("conversation_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at");

  const scenarioPrompt =
    (conversation.conversation_scenarios as unknown as { system_prompt: string } | null)?.system_prompt ?? null;

  const claudeMessage = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    system: buildConversationSystemPrompt(scenarioPrompt),
    messages: (history ?? []).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  });
  const reply = extractText(claudeMessage);

  await supabase
    .from("conversation_messages")
    .insert({ conversation_id: conversationId, role: "assistant", content: reply });

  await logAiUsage(
    supabase,
    user.id,
    "conversation_turn",
    claudeMessage.usage.input_tokens,
    claudeMessage.usage.output_tokens
  );

  return NextResponse.json({ reply });
}
