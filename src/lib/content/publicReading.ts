import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import type { CefrLevel } from "@/types/database";

// Reading texts as public pages (/english-reading): the text and its
// questions, without the answers. Checking and feedback stay in the app.
// Reading texts have no slug column, so the URL comes from the English
// title ("The Night Market" -> the-night-market).

export function readingSlug(titleEn: string): string {
  return titleEn
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface PublicReadingSummary {
  id: string;
  slug: string;
  title_he: string;
  title_en: string;
  cefr_level: CefrLevel;
  words: number;
}

export interface PublicReadingText extends PublicReadingSummary {
  body_en: string;
  questions: { prompt: string; options: string[] }[];
  openQuestions: string[];
}

export const listPublicReading = unstable_cache(
  async (): Promise<PublicReadingSummary[]> => {
    const { data } = await supabaseAdmin
      .from("reading_texts")
      .select("id, title_he, title_en, body_en, cefr_level")
      .eq("status", "published")
      .order("cefr_level")
      .order("sort_order");
    return (data ?? []).map((r) => ({
      id: r.id,
      slug: readingSlug(r.title_en),
      title_he: r.title_he,
      title_en: r.title_en,
      cefr_level: r.cefr_level as CefrLevel,
      words: r.body_en.trim().split(/\s+/).length,
    }));
  },
  ["public-reading-list"],
  { revalidate: 3600 },
);

export const getPublicReading = unstable_cache(
  async (slug: string): Promise<PublicReadingText | null> => {
    const summary = (await listPublicReading()).find((r) => r.slug === slug);
    if (!summary) return null;
    const [{ data: text }, { data: exercises }, { data: open }] = await Promise.all([
      supabaseAdmin.from("reading_texts").select("body_en").eq("id", summary.id).maybeSingle(),
      supabaseAdmin
        .from("exercises")
        .select("type, content")
        .eq("reading_text_id", summary.id)
        .eq("status", "published")
        .order("sort_order"),
      supabaseAdmin.from("reading_open_questions").select("question_en").eq("reading_text_id", summary.id).order("sort_order"),
    ]);
    if (!text) return null;
    return {
      ...summary,
      body_en: text.body_en,
      questions: (exercises ?? [])
        .filter((e) => e.type === "mcq")
        .map((e) => {
          const c = e.content as { prompt: string; options: string[] };
          return { prompt: c.prompt, options: c.options };
        }),
      openQuestions: (open ?? []).map((o) => o.question_en),
    };
  },
  ["public-reading-text"],
  { revalidate: 3600 },
);
