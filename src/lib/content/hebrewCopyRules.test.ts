import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// The owner's copy rule (2026-10-09): no long dash in user-facing Hebrew.
// AI-written Hebrew is held to it by HEBREW_GENDER_NEUTRAL_NOTE; this holds
// the Hebrew written into the code itself to the same rule: lesson and
// Bagrut content, pattern drills, the help chat's knowledge base and the
// public pages, page titles included ("… | Saylo").
const ROOTS = ["src/lib/content", "src/lib/patterns", "src/lib/support/knowledgeBase.ts", "src/app/(marketing)"];

function filesUnder(path: string): string[] {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => filesUnder(join(path, name)));
}

const HEBREW_NEAR_DASH = /[֐-׿][^\n]{0,25}—|—[^\n]{0,25}[֐-׿]/;

describe("Hebrew copy in code", () => {
  it("has no long dash next to Hebrew text", () => {
    const offenders: string[] = [];
    for (const file of ROOTS.flatMap(filesUnder).filter((f) => /\.tsx?$/.test(f) && !f.includes(".test."))) {
      const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ""));
      source.split("\n").forEach((line, i) => {
        const code = line.replace(/(^|[^:])\/\/.*$/, "$1");
        if (HEBREW_NEAR_DASH.test(code)) offenders.push(`${file}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
