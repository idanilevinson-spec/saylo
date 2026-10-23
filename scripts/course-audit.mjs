// Checks src/lib/content/course.ts against the live content: every step's
// key must match one published row, ideally at the unit's own level; and
// lists published content that no unit uses yet (new content to place).
// Read-only. Run: node scripts/course-audit.mjs   (Node 22.6+, it imports
// the .ts file directly)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { COURSE_UNITS } from "../src/lib/content/course.ts";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Same keys as courseProgress.ts.
const SOURCES = {
  vocabulary: ["topics", "slug", "name_he"],
  grammar: ["grammar_topics", "slug", "name_he"],
  speaking: ["conversation_scenarios", "slug", "title_he"],
  reading: ["reading_texts", "title_en", "title_he"],
  listening: ["listening_clips", "title_en", "title_he"],
  writing: ["writing_prompts", "id", "title_he"],
};

let problems = 0;
const used = new Map();
for (const [kind, [table, key, label]] of Object.entries(SOURCES)) {
  const { data, error } = await supabase.from(table).select(`${key}, ${label}, cefr_level`).eq("status", "published").limit(5000);
  if (error) throw new Error(`${table}: ${error.message}`);
  const byKey = new Map(data.map((row) => [row[key], row]));
  const usedKeys = new Set();
  for (const unit of COURSE_UNITS) {
    for (const step of unit.steps.filter((s) => s.kind === kind)) {
      usedKeys.add(step.ref);
      const row = byKey.get(step.ref);
      if (!row) {
        problems++;
        console.log(`MISSING  ${unit.id} ${kind} "${step.ref}" (not published in ${table})`);
      } else if (row.cefr_level !== unit.level) {
        console.log(`LEVEL    ${unit.id} ${kind} "${step.ref}" is ${row.cefr_level}`);
      }
    }
  }
  used.set(kind, data.filter((row) => !usedKeys.has(row[key])).map((row) => `${row.cefr_level} ${row[label]}`));
}

console.log("\nPublished content no unit uses yet:");
for (const [kind, rows] of used) {
  if (rows.length) console.log(`  ${kind} (${rows.length}): ${rows.sort().join(" · ")}`);
}
console.log(`\n${COURSE_UNITS.length} units, ${problems} missing references.`);
process.exit(problems ? 1 : 0);
