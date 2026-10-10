import type { MetadataRoute } from "next";

// Only the real, public, indexable pages — everything under (app) sits
// behind auth and has no business in a sitemap, and (auth) pages are
// transactional, not content search engines should send people to.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.saylolearn.com";
  const now = new Date();

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
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refunds`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/support`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
