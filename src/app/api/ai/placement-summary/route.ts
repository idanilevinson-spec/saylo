import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildPlacementSummaryPrompt, type SkillScore } from "@/lib/ai/prompts/placementSummary";
import { buildWritingCoachPrompt } from "@/lib/ai/prompts/writingCoach";
import { logAiUsage } from "@/lib/ai/usageLog";
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

  let writingUsage = { input_tokens: 0, output_tokens: 0 };
  if (writingSample?.trim()) {
    const writingMessage = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 700,
      messages: [{ role: "user", content: buildWritingCoachPrompt(PLACEMENT_WRITING_PROMPT, writingSample) }],
    });
    writingUsage = writingMessage.usage;
    try {
      const parsed = JSON.parse(extractText(writingMessage)) as { overallScore?: number };
      const percentCorrect = Math.max(0, Math.min(100, parsed.overallScore ?? 0));
      scores.push({ skill: "writing", percentCorrect, cefrLevel: cefrLevelFromPercent(percentCorrect) });
    } catch {
      // If the AI didn't return parseable JSON, skip scoring writing rather
      // than block the rest of the (already-graded) placement result.
    }
  }

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: buildPlacementSummaryPrompt(scores, overallCefr) }],
  });
  const summary = extractText(message);

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

  await logAiUsage(
    supabase,
    user.id,
    "placement_scoring",
    message.usage.input_tokens + writingUsage.input_tokens,
    message.usage.output_tokens + writingUsage.output_tokens
  );

  return NextResponse.json({ overallCefr, summary, scores });
}
