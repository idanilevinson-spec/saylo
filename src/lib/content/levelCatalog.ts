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

export interface LevelSamples {
  words: { headword: string; translation_he: string; example_en: string }[];
  grammar: { name_en: string; name_he: string }[];
  readings: { title_en: string; title_he: string }[];
}

// A real taste of a level for the public level pages: some of its words,
// its grammar topics and reading titles. Same hourly cache as above.
export const getLevelSamples = unstable_cache(
  async (level: CefrLevel): Promise<LevelSamples> => {
    const [words, grammar, readings] = await Promise.all([
      supabaseAdmin
        .from("vocabulary_items")
        .select("headword, translation_he, example_en")
        .eq("status", "published")
        .eq("cefr_level", level)
        .order("sort_order")
        .limit(12),
      supabaseAdmin.from("grammar_topics").select("name_en, name_he").eq("status", "published").eq("cefr_level", level).order("sort_order"),
      supabaseAdmin.from("reading_texts").select("title_en, title_he").eq("status", "published").eq("cefr_level", level).order("sort_order"),
    ]);
    return { words: words.data ?? [], grammar: grammar.data ?? [], readings: readings.data ?? [] };
  },
  ["level-samples"],
  { revalidate: 3600 },
);
