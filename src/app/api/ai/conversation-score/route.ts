import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildConversationScoringPrompt, type TranscriptTurn } from "@/lib/ai/prompts/conversationScoring";
import { logAiUsage } from "@/lib/ai/usageLog";
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

  const claudeMessage = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 700,
    messages: [{ role: "user", content: buildConversationScoringPrompt(transcript) }],
  });
  const raw = extractText(claudeMessage);

  let parsed: ScoringResult;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      fluencyScore: 0,
      grammarScore: 0,
      vocabularyScore: 0,
      overallScore: 0,
      grammarMistakes: [],
      overusedWords: [],
      suggestedVocabulary: [],
      generalSuggestionsHe: "אירעה שגיאה בניתוח השיחה. נסו שיחה חדשה.",
    };
  }

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

  await logAiUsage(
    supabase,
    user.id,
    "conversation_scoring",
    claudeMessage.usage.input_tokens,
    claudeMessage.usage.output_tokens
  );

  return NextResponse.json({ score });
}
