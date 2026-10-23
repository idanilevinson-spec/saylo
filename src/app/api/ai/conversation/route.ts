import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/serverClient";
import { DAILY_LIMIT_ERROR, underDailyAiLimit } from "@/lib/ai/dailyLimit";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildConversationSystemPrompt } from "@/lib/ai/prompts/conversationPartner";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPaidServer } from "@/lib/subscriptions/requirePremium";
import { TRIAL_TEACHER_LIMIT_ERROR, TRIAL_TEACHER_MESSAGES, trialTeacherConversationIds } from "@/lib/subscriptions/teacherTrial";
import { hasParentalClearance } from "@/lib/auth/consentServer";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";
import { splitConversationReply, streamableText, type ConversationFix } from "@/lib/ai/conversationFix";
import { getLearnerMemory } from "@/lib/ai/learnerMemory";
import { buildPersonaNote, detectLearnerMood } from "@/lib/ai/prompts/teacherPersona";
import type { AgeBand, ConversationTopicCategory } from "@/types/database";
import { MAX_MESSAGE_CHARS, historyForModel } from "@/lib/ai/conversationHistory";
import { buildGoalsNote, mergeDone, splitGoalsLine } from "@/lib/ai/conversationGoals";
import { doneFrom, loadScenarioObjectives } from "@/lib/ai/scenarioObjectives";

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
  // Not paying: a trial learner's first conversations still get the teacher.
  const trialConversations = paid ? null : await trialTeacherConversationIds(supabase, user.id);
  if (!paid && !trialConversations) return NextResponse.json({ error: "premium required" }, { status: 403 });
  if (!cleared) {
    return NextResponse.json({ error: "parental consent required" }, { status: 403 });
  }

  if (!(await underDailyAiLimit(supabase, user.id, "conversation_turn"))) {
    return NextResponse.json({ error: DAILY_LIMIT_ERROR }, { status: 429 });
  }

  const { conversationId, message, voiceMode, stream } = (await request.json()) as {
    conversationId?: string;
    message?: string;
    voiceMode?: boolean;
    // Text chat asks for the reply as it is written; a call needs it whole
    // (it is read aloud), so it keeps the JSON answer.
    stream?: boolean;
  };
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: "missing conversationId or message" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: "message too long" }, { status: 400 });
  }
  if (trialConversations && !trialConversations.includes(conversationId)) {
    return NextResponse.json({ error: TRIAL_TEACHER_LIMIT_ERROR }, { status: 403 });
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, conversation_scenarios(system_prompt, category)")
    .eq("id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (conversation.status !== "active") {
    return NextResponse.json({ error: "conversation already completed" }, { status: 400 });
  }

  const scenario = conversation.conversation_scenarios as unknown as {
    system_prompt: string;
    category: ConversationTopicCategory;
  } | null;
  const scenarioPrompt = scenario?.system_prompt ?? null;

  // The conversation is confirmed to be this user's, so the remaining reads
  // are independent of each other and share one round trip. History is read
  // before the new message is stored; the message is appended by hand below.
  const [{ data: priorMessages }, { data: latestPlacement }, memory, { data: learner }, objectives] = await Promise.all([
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
    getLearnerMemory(supabase, user.id, conversationId),
    supabase.from("profiles").select("age_band, bagrut_units").eq("id", user.id).maybeSingle(),
    loadScenarioObjectives(supabase, conversation.scenario_id ?? null),
  ]);
  const doneBefore = doneFrom((conversation as { objectives_done?: unknown }).objectives_done);
  // The trial taste is a few messages per conversation, enough to reach the
  // corrections and the summary.
  if (trialConversations && (priorMessages ?? []).filter((m) => m.role === "user").length >= TRIAL_TEACHER_MESSAGES) {
    return NextResponse.json({ error: TRIAL_TEACHER_LIMIT_ERROR }, { status: 403 });
  }
  const history = [...(priorMessages ?? []), { role: "user", content: message }];
  // The teacher's register for this turn: the situation, the learner's age,
  // and how they are doing right now.
  const personaNote = buildPersonaNote({
    category: scenario?.category ?? null,
    ageBand: (learner?.age_band as AgeBand | undefined) ?? null,
    bagrutUnits: (learner?.bagrut_units as 3 | 4 | 5 | null | undefined) ?? null,
    mood: detectLearnerMood(history.filter((m) => m.role === "user").map((m) => m.content)),
  });

  // Stored while Claude is thinking rather than before it: the reply is what
  // the learner is waiting for, and this write doesn't feed into it.
  const userMessageStored = Promise.resolve(
    supabase.from("conversation_messages").insert({ conversation_id: conversationId, role: "user", content: message })
  );

  // Voice calls are read aloud turn-by-turn, so a web search's round-trip
  // (up to two, per the tool's max_uses) is what turns a snappy back-and-forth
  // into a laggy one — text chat keeps the tool since a few extra seconds is
  // invisible there.
  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: CLAUDE_MODEL,
    max_tokens: 550,
    // thinking disabled: on by default, and eats into both the token
    // budget (risking a truncated reply at only 550 tokens) and latency —
    // the latter matters most for voice turns, which are read aloud
    // turn-by-turn and already had a separate latency fix (skipping web
    // search). See conversation-score route for how the truncation risk
    // was diagnosed.
    thinking: { type: "disabled" as const },
    system: buildConversationSystemPrompt(
      scenarioPrompt,
      latestPlacement?.result_cefr_overall ?? null,
      !voiceMode,
      memory,
      personaNote,
      objectives.length ? buildGoalsNote(objectives, doneBefore) : null,
    ),
    ...(voiceMode ? {} : { tools: [{ type: "web_search_20260318" as const, name: "web_search" as const, max_uses: 2 }] }),
    messages: historyForModel(history).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  };

  // The correction line (if any) comes off before the reply is stored, shown
  // or read aloud; it travels separately and is kept on the reply row. Both
  // writes are independent; the user's message goes first only in the
  // sense that it was already started, so created_at ordering is unchanged.
  const finish = async (claudeMessage: Anthropic.Message) => {
    // The missions line comes off first; a mission once done stays done.
    const { text, goals } = splitGoalsLine(extractText(claudeMessage), objectives.length);
    const goalsDone = mergeDone(doneBefore, goals);
    const { reply, fix } = splitConversationReply(text);
    await userMessageStored;
    await Promise.all([
      storeReply(supabase, conversationId, reply, fix),
      goalsDone.length !== doneBefore.length
        ? Promise.resolve(supabase.from("conversations").update({ objectives_done: goalsDone }).eq("id", conversationId))
        : null,
      logAiUsage(
        supabase,
        user.id,
        "conversation_turn",
        claudeMessage.usage.input_tokens,
        claudeMessage.usage.output_tokens,
        claudeMessage.usage.server_tool_use?.web_search_requests ?? 0
      ),
    ]);
    return { reply, fix, goalsDone };
  };

  if (stream && !voiceMode) {
    // The reply appears as it is written instead of after a silent wait.
    // Only plain text goes out, never the correction line (held back until
    // it is certain a line isn't one); the stream closes after the reply is
    // stored, so the page can then load it with its correction card.
    const claudeStream = anthropic.messages.stream(params);
    const encoder = new TextEncoder();
    // If the learner leaves mid-reply, the reply is still finished and
    // stored; it just stops being sent.
    let listening = true;
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let raw = "";
        let sent = "";
        try {
          for await (const event of claudeStream) {
            if (event.type === "content_block_start" && event.content_block.type === "text" && raw) raw += "\n\n";
            else if (event.type === "content_block_delta" && event.delta.type === "text_delta") raw += event.delta.text;
            else continue;
            const visible = streamableText(raw);
            if (listening && visible.length > sent.length) {
              controller.enqueue(encoder.encode(visible.slice(sent.length)));
              sent = visible;
            }
          }
          await finish(await claudeStream.finalMessage());
        } catch (err) {
          console.error("conversation stream failed", err);
        } finally {
          if (listening) controller.close();
        }
      },
      cancel() {
        listening = false;
      },
    });
    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }

  const { reply, fix, goalsDone } = await finish(await anthropic.messages.create(params));
  return NextResponse.json({ reply, correction: fix, goalsDone });
}

// The correction column comes with seed 050. Until it exists the reply is
// still stored, just without its card, so the order of deploy and SQL
// doesn't matter.
async function storeReply(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  content: string,
  correction: ConversationFix | null,
) {
  const row = { conversation_id: conversationId, role: "assistant" as const, content };
  const withCard: typeof row & { correction?: ConversationFix } = correction ? { ...row, correction } : row;
  const { error } = await supabase.from("conversation_messages").insert(withCard);
  if (error && correction) await supabase.from("conversation_messages").insert(row);
}
