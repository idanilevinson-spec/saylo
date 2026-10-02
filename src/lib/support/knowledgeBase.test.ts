import { describe, expect, it } from "vitest";
import { SUPPORT_KNOWLEDGE_BASE } from "./knowledgeBase";
import { PRICING_PLANS, TRIAL_DAYS } from "@/lib/subscriptions/plans";
import { CONTACT_EMAIL, DAILY_CONVERSATION_LIMIT, DAILY_WRITING_LIMIT } from "@/lib/legal/siteInfo";

// The assistant may only state what this text says, so the numbers in it
// must be the site's real numbers.
describe("support knowledge base", () => {
  it("lists every plan at its real price", () => {
    for (const plan of PRICING_PLANS) {
      expect(SUPPORT_KNOWLEDGE_BASE).toContain(`${plan.label}: ₪${plan.totalPrice}`);
    }
  });

  it("states the real trial length, limits and contact email", () => {
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(`${TRIAL_DAYS} ימי ניסיון`);
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(`עד ${DAILY_CONVERSATION_LIMIT} שיחות חדשות`);
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(`עד ${DAILY_WRITING_LIMIT} הגשות`);
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(CONTACT_EMAIL);
  });

  it("only links to pages that exist under src/app", async () => {
    const { readdirSync } = await import("node:fs");
    const { join } = await import("node:path");
    const routes = new Set<string>();
    const walk = (dir: string, prefix: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === "api" || entry.name.startsWith("[")) continue;
        const segment = entry.name.startsWith("(") ? "" : `/${entry.name}`;
        const path = `${prefix}${segment}`;
        const files = readdirSync(join(dir, entry.name));
        if (files.includes("page.tsx")) routes.add(path || "/");
        walk(join(dir, entry.name), path);
      }
    };
    walk(join(process.cwd(), "src/app"), "");
    const links = [...SUPPORT_KNOWLEDGE_BASE.matchAll(/\]\((\/[^)#]*)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(10);
    for (const link of links) expect(routes, `missing page for ${link}`).toContain(link);
  });
});
