import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { countWords, detectApostropheIssues, detectCapitalizationIssues } from "./textAnalysis";
import { validateAiPatterns } from "./validateAiPatterns";
import type { PatternSource } from "./patternDefinitions";
import type { AgeBand } from "@/types/database";

interface RecordObservationsInput {
  profileId: string;
  ageBand: AgeBand;
  source: PatternSource;
  sourceId: string;
  // For writing: the submitted text. For conversation: the student's turns
  // only, joined — never the AI's own replies.
  sourceText: string;
  // The model's own raw "patterns" field from its JSON response, validated
  // here before anything is trusted or stored.
  rawAiPatterns: unknown;
}

// Writes to learner_pattern_observations always go through the service
// role: like guardian_links before it, a table a client could write to
// directly would let a user fabricate their own "improvement", so the RLS
// policy on this table only ever grants select (migration 033).
//
// Never throws — a failure here must not break the writing-coach or
// conversation-score response the learner is waiting on.
export async function recordPatternObservations(input: RecordObservationsInput): Promise<void> {
  try {
    // Not for minors yet (spec §11, decision 3): parental-consent voice
    // features already carry enough new-data questions on their own, and
    // this needs a lawyer pass first.
    if (input.ageBand !== "adult") return;

    const sampleWords = countWords(input.sourceText);
    if (sampleWords === 0) return;

    const counts = new Map<string, number>();
    for (const { code, occurrences } of validateAiPatterns(input.rawAiPatterns, input.sourceText, input.source)) {
      counts.set(code, occurrences);
    }

    if (input.source === "writing") {
      const capitalization = detectCapitalizationIssues(input.sourceText);
      if (capitalization > 0) counts.set("CAPITALIZATION", Math.min(capitalization, 20));
      const apostrophe = detectApostropheIssues(input.sourceText);
      if (apostrophe > 0) counts.set("APOSTROPHE", Math.min(apostrophe, 20));
    }

    if (counts.size === 0) return;

    const rows = [...counts.entries()].map(([pattern_code, occurrences]) => ({
      profile_id: input.profileId,
      source: input.source,
      source_id: input.sourceId,
      pattern_code,
      occurrences,
      sample_words: sampleWords,
    }));

    await supabaseAdmin
      .from("learner_pattern_observations")
      .upsert(rows, { onConflict: "source,source_id,pattern_code", ignoreDuplicates: true });
  } catch (error) {
    console.error("recordPatternObservations failed", error);
  }
}
