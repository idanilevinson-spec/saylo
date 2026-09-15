import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildConversationScoringPrompt, type TranscriptTurn } from "@/lib/ai/prompts/conversationScoring";
import { logAiUsage } from "@/lib/ai/usageLog";
import { setSkillLevelFromScore } from "@/lib/assessment/skillLevel";
import { isPaidServer } from "@/lib/subscriptions/requirePremium";
import type { ConversationFeedback } from "@/types/database";

interface ScoringResult extends ConversationFeedback {
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  overallScore: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPaidServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { conversationId } = (await request.json()) as { conversationId?: string };
  if (!conversationId) return NextResponse.json({ error: "missing conversationId" }, { status: 400 });

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: messages } = await supabase
    .from("conversation_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at");

  const userTurns = (messages ?? []).filter((m) => m.role === "user");
  if (userTurns.length === 0) {
    return NextResponse.json({ error: "no student messages to evaluate" }, { status: 400 });
  }

  const transcript: TranscriptTurn[] = (messages ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const scoringPrompt = buildConversationScoringPrompt(transcript);
  const claudeMessage = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // Root cause of the real truncated-JSON failures this was hitting:
    // extended thinking is on by default for this model and eats into
    // max_tokens before any output text is written, so a long transcript
    // (many grammar mistakes to describe) could exhaust the whole budget
    // on thinking alone, or leave too little for the JSON to finish —
    // confirmed live against an 18-turn transcript. Disabling thinking for
    // this bounded scoring task (its reasoning isn't shown to the student
    // anyway) makes the token budget predictable, and 2048 leaves real
    // headroom on top of that for a long conversation's worth of feedback.
    max_tokens: 2048,
    thinking: { type: "disabled" },
    messages: [{ role: "user", content: scoringPrompt }],
  });
  let parsed = parseJsonResponse<ScoringResult>(extractText(claudeMessage));
  let inputTokens = claudeMessage.usage.input_tokens;
  let outputTokens = claudeMessage.usage.output_tokens;

  // A single bad generation (the model straying from the JSON-only
  // instruction) shouldn't hand the student an all-zero score screen —
  // one retry recovers the overwhelming majority of those transient misses.
  if (!parsed) {
    const retryMessage = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: scoringPrompt }],
    });
    parsed = parseJsonResponse<ScoringResult>(extractText(retryMessage));
    inputTokens += retryMessage.usage.input_tokens;
    outputTokens += retryMessage.usage.output_tokens;
  }

  parsed = parsed ?? {
    fluencyScore: 0,
    grammarScore: 0,
    vocabularyScore: 0,
    overallScore: 0,
    grammarMistakes: [],
    overusedWords: [],
    suggestedVocabulary: [],
    generalSuggestionsHe: "אירעה שגיאה בניתוח השיחה. נסו שיחה חדשה.",
  };

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n || 0)));

  const { data: score } = await supabase
    .from("conversation_scores")
    .upsert(
      {
        conversation_id: conversationId,
        fluency_score: clamp(parsed.fluencyScore),
        grammar_score: clamp(parsed.grammarScore),
        vocabulary_score: clamp(parsed.vocabularyScore),
        overall_score: clamp(parsed.overallScore),
        feedback: {
          grammarMistakes: parsed.grammarMistakes ?? [],
          overusedWords: parsed.overusedWords ?? [],
          suggestedVocabulary: parsed.suggestedVocabulary ?? [],
          generalSuggestionsHe: parsed.generalSuggestionsHe ?? "",
        },
      },
      { onConflict: "conversation_id" }
    )
    .select()
    .single();

  await supabase
    .from("conversations")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", conversationId);

  await logAiUsage(supabase, user.id, "conversation_scoring", inputTokens, outputTokens);
  await setSkillLevelFromScore(supabase, user.id, "speaking", parsed.overallScore ?? 0);

  return NextResponse.json({ score });
}
