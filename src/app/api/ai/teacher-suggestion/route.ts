import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildTeacherSuggestionPrompt } from "@/lib/ai/prompts/teacherSuggestion";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { data: cached } = await supabase
    .from("teacher_suggestion_cache")
    .select("suggestion, created_at")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (cached && Date.now() - new Date(cached.created_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ suggestion: cached.suggestion });
  }

  const { data: wrongAttempts } = await supabase
    .from("exercise_attempts")
    .select("exercises(grammar_topics(name_he))")
    .eq("profile_id", user.id)
    .eq("is_correct", false)
    .limit(50);

  const topicCounts = new Map<string, number>();
  for (const attempt of wrongAttempts ?? []) {
    const name = (
      attempt.exercises as unknown as { grammar_topics: { name_he: string } | null } | null
    )?.grammar_topics?.name_he;
    if (name) topicCounts.set(name, (topicCounts.get(name) ?? 0) + 1);
  }
  const weakGrammarTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);

  const { count: wordsToReview } = await supabase
    .from("srs_items")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .lte("due_at", new Date().toISOString());

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("profile_id", user.id)
    .maybeSingle();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: buildTeacherSuggestionPrompt({
          weakGrammarTopics,
          wordsToReview: wordsToReview ?? 0,
          currentStreak: streak?.current_streak ?? 0,
        }),
      },
    ],
  });
  const suggestion = extractText(message);

  await logAiUsage(supabase, user.id, "teacher_suggestion", message.usage.input_tokens, message.usage.output_tokens);

  await supabase
    .from("teacher_suggestion_cache")
    .upsert({ profile_id: user.id, suggestion, created_at: new Date().toISOString() });

  return NextResponse.json({ suggestion });
}
