import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildReadingResponsePrompt } from "@/lib/ai/prompts/readingResponse";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { setSkillLevelFromScore } from "@/lib/assessment/skillLevel";
import type { CefrLevel } from "@/types/database";

interface ReadingResponseResult {
  score: number;
  feedbackHe: string;
  modelAnswerEn: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { readingTextId, submittedText, openQuestionId } = (await request.json()) as {
    readingTextId?: string;
    submittedText?: string;
    openQuestionId?: string;
  };
  if (!readingTextId || !submittedText?.trim()) {
    return NextResponse.json({ error: "missing readingTextId or submittedText" }, { status: 400 });
  }

  const { data: text } = await supabase.from("reading_texts").select("*").eq("id", readingTextId).maybeSingle();
  if (!text) return NextResponse.json({ error: "reading text not found" }, { status: 404 });

  // A text can now carry several open questions (reading_open_questions,
  // addressed by id) — fall back to the original single open_question_en
  // column when no id is given, so older callers keep working unchanged.
  let questionEn = text.open_question_en;
  if (openQuestionId) {
    const { data: question } = await supabase
      .from("reading_open_questions")
      .select("question_en")
      .eq("id", openQuestionId)
      .eq("reading_text_id", readingTextId)
      .maybeSingle();
    questionEn = question?.question_en ?? null;
  }
  if (!questionEn) {
    return NextResponse.json({ error: "reading text or question not found" }, { status: 404 });
  }

  const { data: skillLevel } = await supabase
    .from("skill_levels")
    .select("cefr_level")
    .eq("profile_id", user.id)
    .eq("skill", "reading")
    .maybeSingle();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // Detailed Hebrew feedback plus a model answer can run past 700 tokens
    // for longer C1/C2 passages, which truncates the JSON mid-string and
    // makes it unparseable — 1024 leaves real headroom, confirmed against
    // repeated live failures at 700.
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: buildReadingResponsePrompt(
          text.body_en,
          questionEn,
          submittedText,
          (skillLevel?.cefr_level as CefrLevel | undefined) ?? null
        ),
      },
    ],
  });
  const raw = extractText(message);

  const parsed = parseJsonResponse<ReadingResponseResult>(raw) ?? {
    score: 0,
    feedbackHe: "אירעה שגיאה בניתוח התשובה של ה-AI. נסו לשלוח שוב.",
    modelAnswerEn: "",
  };

  const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));

  const { data: response, error: insertError } = await supabase
    .from("reading_responses")
    .insert({
      profile_id: user.id,
      reading_text_id: readingTextId,
      open_question_id: openQuestionId ?? null,
      submitted_text: submittedText,
      score,
      feedback_he: parsed.feedbackHe ?? "",
      model_answer_en: parsed.modelAnswerEn ?? "",
    })
    .select()
    .single();
  if (insertError?.message.includes("daily_reading_response_limit_reached")) {
    return NextResponse.json({ error: "daily limit reached" }, { status: 429 });
  }
  if (insertError || !response) {
    return NextResponse.json({ error: "failed to save response" }, { status: 500 });
  }

  await logAiUsage(supabase, user.id, "reading_response", message.usage.input_tokens, message.usage.output_tokens);
  await setSkillLevelFromScore(supabase, user.id, "reading", score);

  return NextResponse.json({ response });
}
