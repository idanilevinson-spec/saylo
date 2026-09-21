import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import {
  buildPlacementFallbackSummary,
  buildPlacementSummaryPrompt,
  type SkillScore,
} from "@/lib/ai/prompts/placementSummary";
import { buildWritingCoachPrompt } from "@/lib/ai/prompts/writingCoach";
import { logAiUsage } from "@/lib/ai/usageLog";
import { hasAiConsent } from "@/lib/ai/consent";
import { reportAiParseFailure } from "@/lib/ai/reportParseFailure";
import { cefrLevelFromPercent } from "@/lib/assessment/cefrScoring";
import type { SkillArea } from "@/types/database";

const PLACEMENT_WRITING_PROMPT =
  "Write 2-4 sentences about yourself: your name, where you are from, and one thing you like doing.";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { placementTestId, writingSample } = (await request.json()) as {
    placementTestId?: string;
    writingSample?: string;
  };
  if (!placementTestId) return NextResponse.json({ error: "missing placementTestId" }, { status: 400 });

  const { data: test } = await supabase
    .from("placement_tests")
    .select("*")
    .eq("id", placementTestId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!test) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: responses } = await supabase
    .from("placement_test_responses")
    .select("is_correct, placement_questions(skill_area)")
    .eq("placement_test_id", placementTestId);

  if (!responses || responses.length === 0) {
    return NextResponse.json({ error: "no responses recorded" }, { status: 400 });
  }

  const bySkill = new Map<SkillArea, { correct: number; total: number }>();
  for (const r of responses) {
    const skill = (r.placement_questions as unknown as { skill_area: SkillArea } | null)?.skill_area;
    if (!skill) continue;
    const entry = bySkill.get(skill) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (r.is_correct) entry.correct += 1;
    bySkill.set(skill, entry);
  }

  const scores: SkillScore[] = [...bySkill.entries()].map(([skill, { correct, total }]) => {
    const percentCorrect = Math.round((correct / total) * 100);
    return { skill, percentCorrect, cefrLevel: cefrLevelFromPercent(percentCorrect) };
  });

  const totalCorrect = responses.filter((r) => r.is_correct).length;
  const overallPercent = Math.round((totalCorrect / responses.length) * 100);
  const overallCefr = cefrLevelFromPercent(overallPercent);

  // The level is computed from the answers alone. The writing sample and the
  // written summary go to the AI provider, so they only happen once the
  // learner has agreed to that; without it the test still completes.
  const aiAllowed = hasAiConsent(user);

  let writingUsage = { input_tokens: 0, output_tokens: 0 };
  if (aiAllowed && writingSample?.trim()) {
    const writingMessage = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      // thinking disabled: on by default, and silently eats into max_tokens
      // before any output text is written — see conversation-score route
      // for how this was diagnosed as the real truncation cause.
      max_tokens: 1024,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: buildWritingCoachPrompt(PLACEMENT_WRITING_PROMPT, writingSample) }],
    });
    writingUsage = writingMessage.usage;
    const writingRaw = extractText(writingMessage);
    const parsed = parseJsonResponse<{ overallScore?: number }>(writingRaw);
    if (parsed) {
      const percentCorrect = Math.max(0, Math.min(100, parsed.overallScore ?? 0));
      scores.push({ skill: "writing", percentCorrect, cefrLevel: cefrLevelFromPercent(percentCorrect) });
    } else {
      // The AI didn't return parseable JSON — skip scoring writing rather
      // than block the rest of the (already-graded) placement result, but
      // still record it: silently dropping the writing skill from a
      // placement result is a real degradation worth knowing about.
      await reportAiParseFailure("placement-summary (writing)", writingRaw);
    }
  }

  const message = aiAllowed
    ? await anthropic.messages.create({
        model: CLAUDE_MODEL,
        // thinking disabled: on by default, and would silently eat into this
        // already-tight 300-token budget before any output text is written.
        max_tokens: 300,
        thinking: { type: "disabled" },
        messages: [{ role: "user", content: buildPlacementSummaryPrompt(scores, overallCefr) }],
      })
    : null;
  const summary = message ? extractText(message) : buildPlacementFallbackSummary(overallCefr);

  await supabase
    .from("placement_tests")
    .update({
      status: "completed",
      result_cefr_overall: overallCefr,
      result_summary_he: summary,
      completed_at: new Date().toISOString(),
    })
    .eq("id", placementTestId);

  await Promise.all(
    scores.map((s) =>
      supabase
        .from("skill_levels")
        .upsert(
          { profile_id: user.id, skill: s.skill, cefr_level: s.cefrLevel, updated_at: new Date().toISOString() },
          { onConflict: "profile_id,skill" }
        )
    )
  );

  if (message) {
    await logAiUsage(
      supabase,
      user.id,
      "placement_scoring",
      message.usage.input_tokens + writingUsage.input_tokens,
      message.usage.output_tokens + writingUsage.output_tokens
    );
  }

  return NextResponse.json({ overallCefr, summary, scores });
}
