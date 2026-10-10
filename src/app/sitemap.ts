import type { MetadataRoute } from "next";
import { listPublicGrammar } from "@/lib/content/publicGrammar";
import { listPublicVocabulary } from "@/lib/content/publicVocabulary";
import { listPublicReading } from "@/lib/content/publicReading";

// Only the real, public, indexable pages — everything under (app) sits
// behind auth and has no business in a sitemap, and (auth) pages are
// transactional, not content search engines should send people to.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.saylolearn.com";
  const now = new Date();
  const [grammar, vocabulary, reading] = await Promise.all([listPublicGrammar(), listPublicVocabulary(), listPublicReading()]);

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/english-bagrut`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/english-level-test`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...["a", "b", "c", "d", "e", "f", "g"].map((m) => ({
      url: `${base}/english-bagrut/${m}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...["a1", "a2", "b1", "b2", "c1", "c2"].map((l) => ({
      url: `${base}/english-level/${l}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${base}/english-grammar`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...grammar.map((t) => ({
      url: `${base}/english-grammar/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${base}/english-reading`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...reading.map((t) => ({
      url: `${base}/english-reading/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${base}/english-idioms`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/english-vocabulary`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...vocabulary.map((t) => ({
      url: `${base}/english-vocabulary/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refunds`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/support`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
