import { describe, expect, it } from "vitest";
import { SUPPORT_KNOWLEDGE_BASE } from "./knowledgeBase";
import { PRICING_PLANS, TRIAL_DAYS } from "@/lib/subscriptions/plans";
import { CONTACT_EMAIL, DAILY_CONVERSATION_LIMIT, DAILY_WRITING_LIMIT } from "@/lib/legal/siteInfo";
import { PAID_SIMULATIONS_PER_DAY, TRIAL_SIMULATIONS } from "@/lib/bagrut/oralAllowance";
import { TRIAL_TEACHER_CONVERSATIONS, TRIAL_TEACHER_MESSAGES } from "@/lib/subscriptions/teacherTrial";

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
    // Migration 060: the trial counts from the first practice.
    expect(SUPPORT_KNOWLEDGE_BASE).toContain("נספרים מהתרגול הראשון");
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(`עד ${DAILY_CONVERSATION_LIMIT} שיחות חדשות`);
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(`עד ${DAILY_WRITING_LIMIT} הגשות`);
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(CONTACT_EMAIL);
  });

  it("states the oral simulation's real limits and that it is an estimate", () => {
    expect(TRIAL_SIMULATIONS).toBe(1);
    expect(SUPPORT_KNOWLEDGE_BASE).toContain("בתקופת הניסיון: סימולציה אחת");
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(`עד ${PAID_SIMULATIONS_PER_DAY} סימולציות ביום`);
    expect(SUPPORT_KNOWLEDGE_BASE).toContain("לא ציון של בוחן");
  });

  it("states the real trial teacher allowance", () => {
    expect(SUPPORT_KNOWLEDGE_BASE).toContain(
      `${TRIAL_TEACHER_CONVERSATIONS} שיחות, עד ${TRIAL_TEACHER_MESSAGES} הודעות`,
    );
  });

  // The trial teacher numbers live in teacherTrial.ts; a page that types them
  // by hand would keep the old number the day they change.
  it("no source file types the trial teacher numbers by hand", async () => {
    const { readdirSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const hardcoded = /\d+\s*שיחות[^.\n]{0,60}\d+\s*הודעות/;
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (/\.tsx?$/.test(entry.name) && !entry.name.includes(".test.")) {
          if (hardcoded.test(readFileSync(p, "utf8"))) offenders.push(p);
        }
      }
    };
    walk(join(process.cwd(), "src"));
    expect(offenders).toEqual([]);
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
