import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildSpeakingTestQuestionsPrompt } from "@/lib/ai/prompts/speakingTestQuestions";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import type { CefrLevel } from "@/types/database";

const QUESTION_COUNT = 3;

// Generates fresh open-ended spoken-response prompts for one Speaking Test
// attempt — deliberately not cached (unlike topic intros), since the same
// 3 questions every attempt would defeat the point of a test.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { topicNameEn } = (await request.json().catch(() => ({}))) as { topicNameEn?: string };

  const { data: skillLevel } = await supabase
    .from("skill_levels")
    .select("cefr_level")
    .eq("profile_id", user.id)
    .eq("skill", "speaking")
    .maybeSingle();
  const level = (skillLevel?.cefr_level as CefrLevel | undefined) ?? "A1";

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    messages: [
      { role: "user", content: buildSpeakingTestQuestionsPrompt(level, QUESTION_COUNT, topicNameEn) },
    ],
  });
  const raw = extractText(message);
  const parsed = parseJsonResponse<{ questions: string[] }>(raw);

  await logAiUsage(supabase, user.id, "speaking_test_questions", message.usage.input_tokens, message.usage.output_tokens);

  if (!parsed?.questions?.length) {
    return NextResponse.json({ error: "failed to generate questions" }, { status: 502 });
  }

  return NextResponse.json({ questions: parsed.questions });
}
