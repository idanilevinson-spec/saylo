import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { fetchAll } from "@/lib/supabase/fetchAll";
import { readingSlug } from "@/lib/content/publicReading";

// When each public content page last got new content, for the sitemap's
// <lastmod>. The content tables only have created_at, so a page's date is
// the newest row behind it (the topic and its lessons, or the topic and its
// words): adding a lesson or words moves the date, a rebuild doesn't.
// Search engines stop trusting lastmod when every URL carries the build
// time, which is what the sitemap did before.

export interface SitemapDates {
  grammar: Record<string, string>;
  vocabulary: Record<string, string>;
  reading: Record<string, string>;
}

const newest = (a: string | undefined, b: string) => (a && a > b ? a : b);

export const getSitemapDates = unstable_cache(
  async (): Promise<SitemapDates> => {
    const [{ data: grammarTopics }, { data: lessons }, { data: vocabTopics }, { data: words }, { data: texts }] = await Promise.all([
      supabaseAdmin.from("grammar_topics").select("id, slug, created_at").eq("status", "published"),
      fetchAll((from, to) =>
        supabaseAdmin
          .from("grammar_lessons")
          .select("grammar_topic_id, created_at")
          .eq("status", "published")
          .order("id")
          .range(from, to),
      ),
      supabaseAdmin.from("topics").select("id, slug, created_at").eq("status", "published"),
      fetchAll((from, to) =>
        supabaseAdmin
          .from("vocabulary_items")
          .select("topic_id, created_at")
          .eq("status", "published")
          .order("id")
          .range(from, to),
      ),
      supabaseAdmin.from("reading_texts").select("title_en, created_at").eq("status", "published"),
    ]);

    const byTopic = (rows: { topicId: string; created_at: string }[]) => {
      const m = new Map<string, string>();
      for (const r of rows) m.set(r.topicId, newest(m.get(r.topicId), r.created_at));
      return m;
    };
    const lessonDates = byTopic(lessons.map((r) => ({ topicId: r.grammar_topic_id, created_at: r.created_at })));
    const wordDates = byTopic(words.map((r) => ({ topicId: r.topic_id, created_at: r.created_at })));

    const grammar: Record<string, string> = {};
    for (const t of grammarTopics ?? []) grammar[t.slug] = newest(lessonDates.get(t.id), t.created_at);
    const vocabulary: Record<string, string> = {};
    for (const t of vocabTopics ?? []) vocabulary[t.slug] = newest(wordDates.get(t.id), t.created_at);
    const reading: Record<string, string> = {};
    for (const t of texts ?? []) reading[readingSlug(t.title_en)] = t.created_at;
    return { grammar, vocabulary, reading };
  },
  ["sitemap-dates"],
  { revalidate: 3600 },
);

// The newest date in a group, for a hub page that lists those topics.
export function latest(dates: (string | undefined)[]): Date | undefined {
  const known = dates.filter((d): d is string => Boolean(d)).sort();
  return known.length ? new Date(known[known.length - 1]) : undefined;
}
