import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildTeacherSuggestionPrompt } from "@/lib/ai/prompts/teacherSuggestion";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";
import { buildTeacherActions } from "@/lib/teacher/teacherActions";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasAiConsent(user)) {
    return NextResponse.json({ error: AI_CONSENT_REQUIRED_ERROR }, { status: 403 });
  }
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  // The steps under the recommendation are rebuilt on every visit (the
  // counts change during the day); only the AI sentence is cached.
  const [{ data: cached }, { data: wrongAttempts }, { count: wordsToReview }, { data: lastConversation }] =
    await Promise.all([
      supabase.from("teacher_suggestion_cache").select("suggestion, created_at").eq("profile_id", user.id).maybeSingle(),
      supabase
        .from("exercise_attempts")
        .select("exercises(grammar_topics(name_he, slug))")
        .eq("profile_id", user.id)
        .eq("is_correct", false)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("srs_items")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .lte("due_at", new Date().toISOString()),
      supabase
        .from("conversations")
        .select("created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const topicCounts = new Map<string, { nameHe: string; slug: string; count: number }>();
  for (const attempt of wrongAttempts ?? []) {
    const topic = (
      attempt.exercises as unknown as { grammar_topics: { name_he: string; slug: string } | null } | null
    )?.grammar_topics;
    if (!topic) continue;
    const entry = topicCounts.get(topic.slug) ?? { nameHe: topic.name_he, slug: topic.slug, count: 0 };
    entry.count += 1;
    topicCounts.set(topic.slug, entry);
  }
  const weakTopics = [...topicCounts.values()].sort((a, b) => b.count - a.count).slice(0, 2);
  const weakGrammarTopics = weakTopics.map((t) => t.nameHe);

  const actions = buildTeacherActions({
    weakTopics,
    dueWords: wordsToReview ?? 0,
    daysSinceConversation: lastConversation
      ? Math.floor((Date.now() - new Date(lastConversation.created_at).getTime()) / 86_400_000)
      : null,
  });

  if (cached && Date.now() - new Date(cached.created_at).getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ suggestion: cached.suggestion, actions });
  }

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("profile_id", user.id)
    .maybeSingle();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // thinking disabled: on by default, and would silently eat into the
    // token budget before any output text is written. 220 leaves headroom
    // above the ~110 tokens a real reply typically used at 150 — a Hebrew
    // sentence or two runs longer in tokens than in visible characters.
    max_tokens: 220,
    thinking: { type: "disabled" },
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

  return NextResponse.json({ suggestion, actions });
}
