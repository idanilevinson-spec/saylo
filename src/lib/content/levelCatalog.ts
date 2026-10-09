import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import type { CefrLevel } from "@/types/database";

export interface LevelCatalogEntry {
  words: number;
  grammar: number;
  reading: number;
  listening: number;
  scenarios: number;
  writing: number;
}

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// How much published content sits at each level — shown on the landing
// page so "every level has content" is a counted fact, not a claim.
// Counts only, no content; cached for an hour so a landing-page visit
// never waits on the database.
export const getLevelCatalog = unstable_cache(
  async (): Promise<Record<CefrLevel, LevelCatalogEntry>> => {
    const col = (table: string) =>
      supabaseAdmin.from(table).select("cefr_level").eq("status", "published").limit(5000);
    const [words, grammar, reading, listening, scenarios, writing] = await Promise.all([
      col("vocabulary_items"),
      col("grammar_topics"),
      col("reading_texts"),
      col("listening_clips"),
      col("conversation_scenarios"),
      col("writing_prompts"),
    ]);
    const out = Object.fromEntries(
      LEVELS.map((l) => [l, { words: 0, grammar: 0, reading: 0, listening: 0, scenarios: 0, writing: 0 }]),
    ) as Record<CefrLevel, LevelCatalogEntry>;
    const add = (rows: { cefr_level: string }[] | null, key: keyof LevelCatalogEntry) => {
      for (const r of rows ?? []) if (out[r.cefr_level as CefrLevel]) out[r.cefr_level as CefrLevel][key]++;
    };
    add(words.data, "words");
    add(grammar.data, "grammar");
    add(reading.data, "reading");
    add(listening.data, "listening");
    add(scenarios.data, "scenarios");
    add(writing.data, "writing");
    return out;
  },
  ["level-catalog"],
  { revalidate: 3600 },
);
