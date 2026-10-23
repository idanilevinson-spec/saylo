import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { DAILY_LIMIT_ERROR, underDailyAiLimit } from "@/lib/ai/dailyLimit";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildConversationSystemPrompt } from "@/lib/ai/prompts/conversationPartner";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPaidServer } from "@/lib/subscriptions/requirePremium";
import { TRIAL_TEACHER_LIMIT_ERROR, trialTeacherConversationIds } from "@/lib/subscriptions/teacherTrial";
import { hasParentalClearance } from "@/lib/auth/consentServer";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";
import { splitConversationReply } from "@/lib/ai/conversationFix";
import { getLearnerMemory } from "@/lib/ai/learnerMemory";
import { buildPersonaNote } from "@/lib/ai/prompts/teacherPersona";
import { CONVERSATION_OPENER_CUE } from "@/lib/ai/prompts/conversationOpener";
import { buildGoalsNote, splitGoalsLine } from "@/lib/ai/conversationGoals";
import { loadScenarioObjectives } from "@/lib/ai/scenarioObjectives";
import type { AgeBand, ConversationTopicCategory } from "@/types/database";

// The teacher speaks first. An empty screen waiting for the learner is the
// moment people freeze; a real teacher says hello and asks the first
// question, and this one can pick up from what it remembers about them.
// Same gates and the same prompt as every other turn. Only ever writes
// into an empty conversation, so a learner who already typed (or a second
// request) never gets an opener after their own message.
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
  // Not paying: a trial learner's first conversations still get the teacher.
  const trialConversations = paid ? null : await trialTeacherConversationIds(supabase, user.id);
  if (!paid && !trialConversations) return NextResponse.json({ error: "premium required" }, { status: 403 });
  if (!cleared) return NextResponse.json({ error: "parental consent required" }, { status: 403 });

  if (!(await underDailyAiLimit(supabase, user.id, "conversation_opener"))) {
    return NextResponse.json({ error: DAILY_LIMIT_ERROR }, { status: 429 });
  }

  const { conversationId, voiceMode } = (await request.json()) as { conversationId?: string; voiceMode?: boolean };
  if (!conversationId) return NextResponse.json({ error: "missing conversationId" }, { status: 400 });
  if (trialConversations && !trialConversations.includes(conversationId)) {
    return NextResponse.json({ error: TRIAL_TEACHER_LIMIT_ERROR }, { status: 403 });
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, status, scenario_id, conversation_scenarios(system_prompt, category)")
    .eq("id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (conversation.status !== "active") return NextResponse.json({ opener: null });

  const isEmpty = async () => {
    const { count } = await supabase
      .from("conversation_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId);
    return (count ?? 0) === 0;
  };
  if (!(await isEmpty())) return NextResponse.json({ opener: null });

  const scenario = conversation.conversation_scenarios as unknown as {
    system_prompt: string;
    category: ConversationTopicCategory;
  } | null;

  const [{ data: latestPlacement }, memory, { data: learner }, objectives] = await Promise.all([
    supabase
      .from("placement_tests")
      .select("result_cefr_overall")
      .eq("profile_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getLearnerMemory(supabase, user.id, conversationId),
    supabase.from("profiles").select("age_band, bagrut_units").eq("id", user.id).maybeSingle(),
    loadScenarioObjectives(supabase, (conversation as { scenario_id?: string | null }).scenario_id ?? null),
  ]);
  const personaNote = buildPersonaNote({
    category: scenario?.category ?? null,
    ageBand: (learner?.age_band as AgeBand | undefined) ?? null,
    bagrutUnits: (learner?.bagrut_units as 3 | 4 | 5 | null | undefined) ?? null,
    mood: "steady",
  });

  const claudeMessage = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    thinking: { type: "disabled" },
    system: buildConversationSystemPrompt(
      scenario?.system_prompt ?? null,
      latestPlacement?.result_cefr_overall ?? null,
      // Same switch as a turn: text chat (may search) vs a spoken call.
      !voiceMode,
      memory,
      personaNote,
      // The scene opens towards the first mission; none is done yet.
      objectives.length ? buildGoalsNote(objectives, []) : null,
    ),
    messages: [{ role: "user", content: CONVERSATION_OPENER_CUE(!!voiceMode) }],
  });
  const { input_tokens, output_tokens } = claudeMessage.usage;
  after(() => logAiUsage(supabase, user.id, "conversation_opener", input_tokens, output_tokens));

  // An opener corrects nothing; any stray correction line is dropped.
  const { reply } = splitConversationReply(splitGoalsLine(extractText(claudeMessage), objectives.length).text);
  if (!reply.trim()) return NextResponse.json({ opener: null });

  // The learner may have typed while this was being written: theirs wins.
  if (!(await isEmpty())) return NextResponse.json({ opener: null });
  const { error } = await supabase
    .from("conversation_messages")
    .insert({ conversation_id: conversationId, role: "assistant", content: reply });
  if (error) return NextResponse.json({ opener: null });

  return NextResponse.json({ opener: reply });
}
