import { describe, expect, it } from "vitest";
import robots from "./robots";

const rules = () => {
  const r = robots().rules;
  return Array.isArray(r) ? r : [r];
};
const agents = (ua: string | string[] | undefined) => (Array.isArray(ua) ? ua : ua ? [ua] : []);

describe("robots", () => {
  it("blocks AI training crawlers from the whole site", () => {
    const training = rules().find((r) => agents(r.userAgent).includes("GPTBot"));
    expect(training?.disallow).toBe("/");
    expect(agents(training?.userAgent)).toEqual(
      expect.arrayContaining(["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "Applebot-Extended"]),
    );
  });

  it("never blocks search engines or the bots that answer users with a link to us", () => {
    const blocked = rules()
      .filter((r) => r.disallow === "/")
      .flatMap((r) => agents(r.userAgent).map((a) => a.toLowerCase()));
    for (const bot of ["*", "googlebot", "bingbot", "oai-searchbot", "chatgpt-user", "claude-searchbot", "claude-user", "perplexitybot", "applebot"]) {
      expect(blocked).not.toContain(bot);
    }
  });

  it("keeps the public pages open to everyone else and the sitemap listed", () => {
    const all = rules().find((r) => agents(r.userAgent).includes("*"));
    expect(all?.allow).toBe("/");
    expect(all?.disallow).toContain("/api/");
    expect(all?.disallow).not.toContain("/english-reading");
    expect(robots().sitemap).toBe("https://www.saylolearn.com/sitemap.xml");
  });
});
