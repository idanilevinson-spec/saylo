// Sanity checks over published learning content: broken exercises (bad
// answer index, duplicate options, MCQ answer that doesn't match its word),
// vocabulary whose example doesn't use the word, duplicates, and long
// dashes in learner-facing Hebrew. Read-only. Run after every content seed:
//   node scripts/content-audit.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function all(table, cols) {
  let out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(cols).range(from, from + 999);
    if (error) throw error;
    out = out.concat(data);
    if (data.length < 1000) return out;
  }
}

const issues = [];
const add = (kind, id, msg) => issues.push(`${kind.padEnd(18)} ${id.slice(0, 8)} ${msg}`);
const norm = (s) => (s ?? "").toLowerCase().replace(/[^a-z' -]/g, " ");
const stem = (w) => (w.length > 4 ? w.slice(0, w.length - 2) : w.replace(/[ey]$/, ""));
const HEB = /[֐-׿]/;

const vocab = (await all("vocabulary_items", "id,headword,part_of_speech,translation_he,example_en,cefr_level,status,topic_id")).filter(
  (v) => v.status === "published",
);
const vocabById = new Map(vocab.map((v) => [v.id, v]));
const seen = new Map();
for (const v of vocab) {
  const h = v.headword.toLowerCase().trim();
  if (!h.split(/\s+/).every((w) => norm(v.example_en).includes(stem(w))))
    add("VOCAB-EXAMPLE", v.id, `${v.cefr_level} "${v.headword}" not in: ${v.example_en}`);
  if (!v.translation_he?.trim()) add("VOCAB-NO-HE", v.id, v.headword);
  if (HEB.test(v.translation_he) && v.translation_he.includes("—")) add("DASH", v.id, v.translation_he);
  // Same word in the same topic twice is a real duplicate; in two topics it can be on purpose.
  const k = `${h}|${v.part_of_speech}|${v.topic_id}`;
  if (seen.has(k)) add("VOCAB-DUP", v.id, `${v.headword} (${v.cefr_level}) also ${seen.get(k)}`);
  else seen.set(k, v.cefr_level);
}

const exercises = (await all("exercises", "id,type,content,status,cefr_level,vocabulary_item_id")).filter((e) => e.status === "published");
const promptSeen = new Set();
for (const e of exercises) {
  const c = e.content ?? {};
  if (e.type === "mcq") {
    if (!Array.isArray(c.options) || c.options.length < 2) {
      add("MCQ-OPTIONS", e.id, JSON.stringify(c).slice(0, 120));
      continue;
    }
    if (!(c.correctIndex >= 0 && c.correctIndex < c.options.length)) add("MCQ-INDEX", e.id, JSON.stringify(c).slice(0, 150));
    const lower = c.options.map((o) => String(o).trim().toLowerCase());
    if (new Set(lower).size !== lower.length) add("MCQ-DUP-OPTION", e.id, `${c.prompt} ${JSON.stringify(c.options)}`);
    const v = e.vocabulary_item_id && vocabById.get(e.vocabulary_item_id);
    if (v && /באנגלית עבור/.test(c.prompt) && lower[c.correctIndex] !== v.headword.toLowerCase().trim())
      add("MCQ-WRONG-WORD", e.id, `${c.prompt} answer=${c.options[c.correctIndex]} word=${v.headword}`);
    const pk = `${e.cefr_level}|${c.prompt}|${[...lower].sort().join(",")}`;
    if (promptSeen.has(pk)) add("MCQ-DUPLICATE", e.id, c.prompt);
    else promptSeen.add(pk);
  } else if (e.type === "fill_blank") {
    if (!c.sentence?.includes("___")) add("FILL-NO-BLANK", e.id, c.sentence);
    if (!c.correctAnswer?.trim()) add("FILL-NO-ANSWER", e.id, c.sentence);
  } else if (e.type === "reorder") {
    const o = c.correctOrder;
    if (!Array.isArray(o) || o.length !== c.tokens?.length || new Set(o).size !== o.length) add("REORDER", e.id, JSON.stringify(c));
  } else if (e.type === "match") {
    const l = c.pairs?.map((p) => p.left.toLowerCase());
    const r = c.pairs?.map((p) => p.right);
    if (!l || new Set(l).size !== l.length || new Set(r).size !== r.length) add("MATCH-DUP", e.id, JSON.stringify(c.pairs));
  } else if (e.type === "dictation") {
    if (!c.audioText?.trim() || !c.correctAnswer?.trim()) add("DICTATION", e.id, JSON.stringify(c));
  }
  for (const [k, val] of Object.entries(c))
    if (typeof val === "string" && HEB.test(val) && val.includes("—")) add("DASH", e.id, `${k}: ${val.slice(0, 90)}`);
}

// Irregular past forms ("ran into") defeat a stem match, so an idiom passes if
// any of its content words shows up in the example.
const idioms = (await all("idioms_phrasal_verbs", "id,phrase,example_en,status")).filter((i) => i.status === "published");
for (const i of idioms) {
  const words = i.phrase.toLowerCase().split(/\s+/).filter((w) => w.length >= 2 && w !== "to" && w !== "the" && w !== "a");
  if (!words.some((w) => norm(i.example_en).includes(stem(w)))) add("IDIOM-EXAMPLE", i.id, `"${i.phrase}" not in: ${i.example_en}`);
}

for (const [table, col] of [["grammar_topics", "name_he"], ["topics", "name_he"], ["reading_texts", "title_he"], ["listening_clips", "title_he"]]) {
  const { data } = await sb.from(table).select(`id,${col}`).like(col, "%—%");
  for (const r of data ?? []) add("DASH", r.id, `${table}.${col}: ${r[col]}`);
}

console.log(`Checked ${vocab.length} words, ${exercises.length} exercises, ${idioms.length} idioms.`);
console.log(issues.length ? issues.join("\n") : "No issues found.");
process.exitCode = issues.length ? 1 : 0;
