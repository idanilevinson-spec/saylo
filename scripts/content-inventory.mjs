// Counts published content per CEFR level, per content type — to see
// where a level is thin. Read-only. Run: node scripts/content-inventory.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TABLES = [
  ["topics", null],
  ["vocabulary_items", "status"],
  ["grammar_topics", null],
  ["grammar_lessons", null],
  ["exercises", "status"],
  ["reading_texts", "status"],
  ["listening_clips", "status"],
  ["idioms_phrasal_verbs", null],
  ["writing_prompts", null],
  ["conversation_scenarios", "status"],
  ["learning_path_nodes", null],
];

const rows = [];
for (const [table, statusCol] of TABLES) {
  const counts = {};
  for (const level of LEVELS) {
    let q = supabase.from(table).select("*", { count: "exact", head: true }).eq("cefr_level", level);
    if (statusCol) q = q.eq(statusCol, "published");
    const { count, error } = await q;
    counts[level] = error ? `err` : count;
  }
  rows.push([table, ...LEVELS.map((l) => String(counts[l]))]);
}
// Exercises by skill area too.
// Paged: the API returns at most 1000 rows per request, and there are more.
const ex = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("exercises")
    .select("skill_area, type, cefr_level")
    .eq("status", "published")
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  ex.push(...data);
  if (data.length < 1000) break;
}
const bySkill = {};
for (const e of ex) {
  const k = `${e.skill_area}/${e.type}`;
  bySkill[k] ??= Object.fromEntries(LEVELS.map((l) => [l, 0]));
  bySkill[k][e.cefr_level]++;
}
console.log(["table", ...LEVELS].join("\t"));
for (const r of rows) console.log(r.join("\t"));
console.log("\nexercises by skill/type:");
for (const [k, v] of Object.entries(bySkill).sort()) console.log([k.padEnd(28), ...LEVELS.map((l) => v[l])].join("\t"));
