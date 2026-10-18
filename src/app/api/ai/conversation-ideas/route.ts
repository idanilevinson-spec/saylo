import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildReplyIdeasPrompt, cleanReplyIdeas } from "@/lib/ai/prompts/replyIdeas";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPaidServer } from "@/lib/subscriptions/requirePremium";
import { hasParentalClearance } from "@/lib/auth/consentServer";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";

// Three ways to answer the teacher's last message, for a learner who is
// stuck. Same gates as the conversation itself. Nothing is stored: the
// learner sends their chosen answer through the normal conversation turn.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasAiConsent(user)) {
    return NextResponse.json({ error: AI_CONSENT_REQUIRED_ERROR }, { status: 403 });
  }
  const [paid, cleared] = await Promise.all([isPaidServer(supabase, user.id), hasParentalClearance(supabase, user.id)]);
  if (!paid) return NextResponse.json({ error: "premium required" }, { status: 403 });
  if (!cleared) return NextResponse.json({ error: "parental consent required" }, { status: 403 });

  const { conversationId } = (await request.json()) as { conversationId?: string };
  if (!conversationId) return NextResponse.json({ error: "missing conversationId" }, { status: 400 });

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, status, conversation_scenarios(title_en, system_prompt)")
    .eq("id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (conversation.status !== "active") {
    return NextResponse.json({ error: "conversation already completed" }, { status: 400 });
  }

  const [{ data: recent }, { data: latestPlacement }] = await Promise.all([
    supabase
      .from("conversation_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("placement_tests")
      .select("result_cefr_overall")
      .eq("profile_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const transcript = (recent ?? []).reverse();
  // Ideas answer the teacher; right after the learner spoke there is
  // nothing to answer yet.
  if (transcript.length && transcript[transcript.length - 1].role !== "assistant") {
    return NextResponse.json({ ideas: [] });
  }
  const scenario = conversation.conversation_scenarios as unknown as { title_en: string; system_prompt: string } | null;
  const situation = scenario ? `Scenario: ${scenario.title_en}. ${scenario.system_prompt}` : "A free conversation with the teacher.";

  const claudeMessage = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    thinking: { type: "disabled" },
    system: buildReplyIdeasPrompt(latestPlacement?.result_cefr_overall ?? null),
    messages: [
      {
        role: "user",
        content: transcript.length
          ? `${situation}\n\nThe conversation so far:\n${transcript
              .map((m) => `${m.role === "user" ? "Learner" : "Teacher"}: ${m.content}`)
              .join("\n")}`
          : `${situation}\n\nNothing has been said yet: the learner speaks first. Write three ways to open this conversation.`,
      },
    ],
  });
  const ideas = cleanReplyIdeas(parseJsonResponse<{ ideas?: unknown }>(extractText(claudeMessage)));

  await logAiUsage(supabase, user.id, "conversation_ideas", claudeMessage.usage.input_tokens, claudeMessage.usage.output_tokens);

  return NextResponse.json({ ideas });
}
