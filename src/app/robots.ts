import type { MetadataRoute } from "next";

// Crawlers (or opt-out tokens) whose only job is collecting text to train AI
// models. Saylo's content is its own and not offered for training (terms,
// "קניין רוחני"). Search and answer bots that send people here are NOT on
// this list on purpose: Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User,
// Claude-SearchBot, Claude-User, PerplexityBot. Google-Extended and
// Applebot-Extended don't crawl; they only tell Google and Apple not to
// train on what Googlebot/Applebot already fetched, so search is unaffected.
const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_TRAINING_BOTS, disallow: "/" },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/consent/",
          "/dashboard",
          "/placement",
          "/learn",
          "/course",
          "/vocabulary",
          "/grammar",
          "/reading",
          "/listening",
          "/writing",
          "/speaking",
          "/idioms",
          "/games",
          "/review",
          "/profile",
          "/progress",
        ],
      },
    ],
    sitemap: "https://www.saylolearn.com/sitemap.xml",
  };
}
