import type { MetadataRoute } from "next";
import { listPublicGrammar } from "@/lib/content/publicGrammar";
import { listPublicVocabulary } from "@/lib/content/publicVocabulary";
import { listPublicReading } from "@/lib/content/publicReading";
import { getSitemapDates, latest } from "@/lib/content/sitemapDates";

// Only the real, public, indexable pages — everything under (app) sits
// behind auth and has no business in a sitemap, and (auth) pages are
// transactional, not content search engines should send people to.
//
// lastModified is given only where we know it: content pages carry the
// date their newest lesson/word/text was added, and each hub the newest of
// its topics. Hand-written pages (home, pricing, legal) carry none, rather
// than the build time, which made search engines ignore the dates.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.saylolearn.com";
  const [grammar, vocabulary, reading, dates] = await Promise.all([
    listPublicGrammar(),
    listPublicVocabulary(),
    listPublicReading(),
    getSitemapDates(),
  ]);
  const at = (d: string | undefined) => (d ? { lastModified: new Date(d) } : {});
  const hub = (d: Date | undefined) => (d ? { lastModified: d } : {});

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/try`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/english-bagrut`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/english-level-test`, changeFrequency: "weekly", priority: 0.9 },
    ...["a", "b", "c", "d", "e", "f", "g"].map((m) => ({
      url: `${base}/english-bagrut/${m}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...["a1", "a2", "b1", "b2", "c1", "c2"].map((l) => ({
      url: `${base}/english-level/${l}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    {
      url: `${base}/english-grammar`,
      ...hub(latest(grammar.map((t) => dates.grammar[t.slug]))),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...grammar.map((t) => ({
      url: `${base}/english-grammar/${t.slug}`,
      ...at(dates.grammar[t.slug]),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${base}/english-reading`,
      ...hub(latest(reading.map((t) => dates.reading[t.slug]))),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...reading.map((t) => ({
      url: `${base}/english-reading/${t.slug}`,
      ...at(dates.reading[t.slug]),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${base}/english-writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/english-idioms`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${base}/english-vocabulary`,
      ...hub(latest(vocabulary.map((t) => dates.vocabulary[t.slug]))),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...vocabulary.map((t) => ({
      url: `${base}/english-vocabulary/${t.slug}`,
      ...at(dates.vocabulary[t.slug]),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refunds`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/support`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/accessibility`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
