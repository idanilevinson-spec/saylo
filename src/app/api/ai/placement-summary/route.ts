import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
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
import { cefrLevelFromPercent, placementScore } from "@/lib/assessment/cefrScoring";
import { gradeBagrutSection } from "@/lib/content/bagrut/placementItems";
import type { SkillArea } from "@/types/database";

const PLACEMENT_WRITING_PROMPT =
  "Write 2-4 sentences about yourself: your name, where you are from, and one thing you like doing.";

// The level comes from the answers; the AI only adds the writing score and
// the written summary. An AI call that fails or hangs must not stop the test
// from completing: nothing in the app opens until it has, and the page gives
// up after 30 seconds (the SDK's own default waits up to 10 minutes, with
// retries). Both limits together stay under the page's.
const WRITING_TIMEOUT_MS = 12_000;
const SUMMARY_TIMEOUT_MS = 10_000;

async function optionalAi(
  label: string,
  params: Anthropic.MessageCreateParamsNonStreaming,
  timeout: number
): Promise<Anthropic.Message | null> {
  try {
    return await anthropic.messages.create(params, { timeout, maxRetries: 0 });
  } catch (err) {
    console.error(`placement-summary ${label} skipped:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { placementTestId, writingSample, bagrutUnits, bagrutAnswers } = (await request.json()) as {
    placementTestId?: string;
    writingSample?: string;
    bagrutUnits?: number;
    bagrutAnswers?: unknown;
  };
  if (!placementTestId) return NextResponse.json({ error: "missing placementTestId" }, { status: 400 });

  const { data: test } = await supabase
    .from("placement_tests")
    .select("*")
    .eq("id", placementTestId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!test) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: rawResponses } = await supabase
    .from("placement_test_responses")
    .select("question_id, is_correct, placement_questions(skill_area)")
    .eq("placement_test_id", placementTestId);

  // No responses at all means every question was skipped, which is scored
  // like guessing (see placementScore) rather than refused: refusing left
  // the learner on an error with "try again" that could never succeed, and
  // shut out of the app, since nothing opens until the test is completed.
  if (!rawResponses) {
    return NextResponse.json({ error: "responses unavailable" }, { status: 500 });
  }
  // One answer per question. A fast double tap on "הבא" used to save the
  // same answer more than once, which counted it twice (or three times).
  const seen = new Set<string>();
  const responses = rawResponses.filter((r) => !seen.has(r.question_id) && seen.add(r.question_id));

  // Every published question was on the learner's test (the page shows all
  // of them), so whatever wasn't answered was skipped; see placementScore.
  const { data: published } = await supabase.from("placement_questions").select("skill_area").eq("status", "published");
  const questionsBySkill = new Map<SkillArea, number>();
  for (const q of published ?? []) {
    const skill = q.skill_area as SkillArea;
    questionsBySkill.set(skill, (questionsBySkill.get(skill) ?? 0) + 1);
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
    const { percentCorrect, level } = placementScore({ correct, answered: total, questions: questionsBySkill.get(skill) ?? total });
    return { skill, percentCorrect, cefrLevel: level };
  });

  const totalCorrect = responses.filter((r) => r.is_correct).length;
  const overallCefr = placementScore({
    correct: totalCorrect,
    answered: responses.length,
    questions: published?.length ?? responses.length,
  }).level;

  // The level is computed from the answers alone. The writing sample and the
  // written summary go to the AI provider, so they only happen once the
  // learner has agreed to that; without it the test still completes.
  const aiAllowed = hasAiConsent(user);

  let writingUsage = { input_tokens: 0, output_tokens: 0 };
  const writingMessage =
    aiAllowed && writingSample?.trim()
      ? await optionalAi(
          "writing",
          {
            model: CLAUDE_MODEL,
            // thinking disabled: on by default, and silently eats into max_tokens
            // before any output text is written — see conversation-score route
            // for how this was diagnosed as the real truncation cause.
            max_tokens: 1024,
            thinking: { type: "disabled" },
            messages: [{ role: "user", content: buildWritingCoachPrompt(PLACEMENT_WRITING_PROMPT, writingSample) }],
          },
          WRITING_TIMEOUT_MS
        )
      : null;
  if (writingMessage) {
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

  // The optional Bagrut-format section is graded here, against the key in
  // code, and kept out of the CEFR scores above (see migration 045).
  const bagrutTrack = bagrutUnits === 3 || bagrutUnits === 4 || bagrutUnits === 5 ? bagrutUnits : null;
  const bagrut =
    bagrutTrack && Array.isArray(bagrutAnswers)
      ? {
          units: bagrutTrack,
          ...gradeBagrutSection(
            bagrutTrack,
            bagrutAnswers.map((a) => (typeof a === "number" ? a : null))
          ),
        }
      : null;

  const message = aiAllowed
    ? await optionalAi(
        "summary",
        {
          model: CLAUDE_MODEL,
          // thinking disabled: on by default, and would silently eat into this
          // already-tight 300-token budget before any output text is written.
          max_tokens: 300,
          thinking: { type: "disabled" },
          messages: [{ role: "user", content: buildPlacementSummaryPrompt(scores, overallCefr) }],
        },
        SUMMARY_TIMEOUT_MS
      )
    : null;
  const summary = message ? extractText(message) : buildPlacementFallbackSummary(overallCefr);

  const { error: completeError } = await supabase
    .from("placement_tests")
    .update({
      status: "completed",
      result_cefr_overall: overallCefr,
      result_summary_he: summary,
      completed_at: new Date().toISOString(),
    })
    .eq("id", placementTestId);
  // Showing a result that wasn't saved would send the learner from it
  // straight back to the test (the app only opens for a completed one);
  // an error keeps them on the page's "try again" instead.
  if (completeError) {
    console.error("placement completion not saved:", completeError.message);
    return NextResponse.json({ error: "not saved" }, { status: 500 });
  }

  // Separate write so a missing migration 045 can only lose the Bagrut
  // score, never the test's completion.
  if (bagrut) {
    const { error: bagrutError } = await supabase
      .from("placement_tests")
      .update({ bagrut_units: bagrut.units, bagrut_percent: bagrut.percent })
      .eq("id", placementTestId);
    if (bagrutError) console.error("placement bagrut score not saved:", bagrutError.message);
  }

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

  return NextResponse.json({ overallCefr, summary, scores, bagrut });
}
