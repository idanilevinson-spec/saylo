// Writes supabase/seed/059_vocab_expansion.sql from
// scripts/content/vocabExpansion.mjs: new words appended to nine existing
// vocabulary topics, plus the "nervous" translation fix (word, multiple
// choice prompt and match pair). Run: node scripts/generate-vocab-expansion.mjs
// With .env.local present it also checks the words against the database:
// no headword that already exists anywhere, and no Hebrew translation that
// repeats one already in the same topic (match games need them distinct).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { VOCAB_ADDITIONS, FIXES } from "./content/vocabExpansion.mjs";
import { buildMcq } from "./content/vocabMcq.mjs";

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const errors = [];
const HEBREW = /[֐-׿]/;

for (const [slug, words] of Object.entries(VOCAB_ADDITIONS)) {
  const heads = new Set();
  const hebrew = new Set();
  for (const w of words) {
    const [headword, ipa, pos, he, example, definition] = w;
    if (w.length !== 6 || w.some((x) => !String(x).trim())) errors.push(`${slug}: incomplete row ${headword}`);
    if (!/^\/.+\/$/.test(ipa)) errors.push(`${slug}: ${headword}: ipa not in slashes`);
    if (!HEBREW.test(he)) errors.push(`${slug}: ${headword}: translation has no Hebrew`);
    if (HEBREW.test(example) || HEBREW.test(definition)) errors.push(`${slug}: ${headword}: Hebrew in the English`);
    if (!new RegExp(`\\b${headword.split(" ")[0]}`, "i").test(example)) errors.push(`${slug}: ${headword}: example doesn't use the word`);
    if (heads.has(headword.toLowerCase())) errors.push(`${slug}: duplicate ${headword}`);
    if (hebrew.has(he)) errors.push(`${slug}: duplicate Hebrew ${he}`);
    heads.add(headword.toLowerCase());
    hebrew.add(he);
    void pos;
  }
}

const existingBySlug = {};
const envPath = new URL("../.env.local", import.meta.url);
if (existsSync(envPath)) {
  const env = Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
  );
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const [{ data: items, error: e1 }, { data: topics, error: e2 }] = await Promise.all([
    sb.from("vocabulary_items").select("headword, translation_he, topic_id").limit(10000),
    sb.from("topics").select("id, slug"),
  ]);
  if (e1 || e2) throw e1 ?? e2;
  const slugOf = new Map(topics.map((t) => [t.id, t.slug]));
  const ours = new Set(Object.values(VOCAB_ADDITIONS).flat().map((w) => w[0].toLowerCase()));
  for (const it of items) {
    // Re-running after the seed is applied finds our own words; that's fine.
    const slug = slugOf.get(it.topic_id);
    const mine = VOCAB_ADDITIONS[slug]?.some((w) => w[0].toLowerCase() === it.headword.toLowerCase());
    if (ours.has(it.headword.toLowerCase()) && !mine) errors.push(`${it.headword}: already in the database (${slug})`);
    if (!mine && VOCAB_ADDITIONS[slug]?.some((w) => w[3] === it.translation_he))
      errors.push(`${slug}: Hebrew "${it.translation_he}" already used by ${it.headword}`);
  }
  for (const slug of Object.keys(VOCAB_ADDITIONS)) if (!topics.some((t) => t.slug === slug)) errors.push(`no topic ${slug}`);
  // The topic's words already published, for the mcq wrong options.
  for (const it of items) {
    const slug = slugOf.get(it.topic_id);
    if (!VOCAB_ADDITIONS[slug] || VOCAB_ADDITIONS[slug].some((w) => w[0] === it.headword)) continue;
    (existingBySlug[slug] ??= []).push({ headword: it.headword, he: FIXES.find((f) => f.headword === it.headword)?.to ?? it.translation_he });
  }
} else {
  errors.push("needs .env.local: the mcq wrong options come from each topic's published words");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const slugs = Object.keys(VOCAB_ADDITIONS);
const rows = Object.entries(VOCAB_ADDITIONS).flatMap(([slug, words]) =>
  words.map(([headword, ipa, pos, he, example, definition], i) =>
    `  (${q(slug)}, ${q(headword)}, ${q(ipa)}, ${q(pos)}, ${q(he)}, ${q(example)}, ${q(definition)}, ${100 + i})`,
  ),
);
export const MCQS = Object.entries(VOCAB_ADDITIONS).flatMap(([slug, words]) => {
  const topicWords = [...(existingBySlug[slug] ?? []), ...words.map((w) => ({ headword: w[0], he: w[3] }))];
  return words.map((w, i) => ({ slug, headword: w[0], sort: 100 + i, ...buildMcq({ headword: w[0], he: w[3] }, topicWords) }));
});
const mcqRows = MCQS.map(
  (m) => `  (${q(m.slug)}, ${q(m.headword)}, ${q(JSON.stringify({ prompt: m.prompt, options: m.options, correctIndex: m.correctIndex }))}, ${m.sort})`,
);
writeFileSync(new URL("../supabase/seed/059_vocab_mcqs.json", import.meta.url), JSON.stringify(MCQS, null, 1));
const fixes = FIXES.map(
  (f) => `update public.vocabulary_items v set translation_he = ${q(f.to)}
from public.topics t
where t.id = v.topic_id and t.slug = ${q(f.slug)} and v.headword = ${q(f.headword)} and v.translation_he = ${q(f.from)};

-- The same word inside that topic's exercises (multiple choice prompt, match pair).
update public.exercises e set content = replace(e.content::text, ${q(f.from)}, ${q(f.to.split(",")[0])})::jsonb
from public.topics t
where t.id = e.topic_id and t.slug = ${q(f.slug)} and e.content::text like ${q(`%${f.from}%`)};
`,
);

const sql = `-- 059_vocab_expansion (generated by scripts/generate-vocab-expansion.mjs
-- from scripts/content/vocabExpansion.mjs; edit the content there, not here).
-- ${rows.length} new words for the ${slugs.length} thinnest vocabulary topics
-- (${slugs.join(", ")}), appended after the existing words (sort_order 100+).
-- All examples and definitions are original (2026-11-18). Also fixes
-- "nervous" (לחוץ, not עצבני) in the word and its exercises.
-- Every word also gets the multiple-choice exercise the daily review needs
-- (src/lib/srs/queue.ts drops words without one).
-- Safe to re-run, and never deletes: deleting a word or an exercise would
-- cascade to learners' srs_items and exercise_attempts. Missing rows are
-- inserted, existing ones are updated in place.

with gen(slug, headword, ipa, pos, he, example, definition, sort_order) as (values
${rows.join(",\n")}
)
insert into public.vocabulary_items (topic_id, headword, ipa, part_of_speech, translation_he, example_en, definition_en, cefr_level, sort_order)
select t.id, gen.headword, gen.ipa, gen.pos, gen.he, gen.example, gen.definition, t.cefr_level, gen.sort_order
from gen join public.topics t on t.slug = gen.slug
where not exists (select 1 from public.vocabulary_items v where v.topic_id = t.id and v.headword = gen.headword);

with gen(slug, headword, ipa, pos, he, example, definition, sort_order) as (values
${rows.join(",\n")}
)
update public.vocabulary_items v
set ipa = gen.ipa, part_of_speech = gen.pos, translation_he = gen.he, example_en = gen.example, definition_en = gen.definition
from gen join public.topics t on t.slug = gen.slug
where v.topic_id = t.id and v.headword = gen.headword;

with gen(slug, headword, content, sort_order) as (values
${mcqRows.join(",\n")}
)
update public.exercises e set content = gen.content::jsonb
from gen join public.topics t on t.slug = gen.slug
join public.vocabulary_items v on v.topic_id = t.id and v.headword = gen.headword
where e.vocabulary_item_id = v.id and e.type = 'mcq';

with gen(slug, headword, content, sort_order) as (values
${mcqRows.join(",\n")}
)
insert into public.exercises (type, skill_area, topic_id, vocabulary_item_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'vocabulary'::skill_area, t.id, v.id, t.cefr_level, gen.content::jsonb, gen.sort_order
from gen join public.topics t on t.slug = gen.slug
join public.vocabulary_items v on v.topic_id = t.id and v.headword = gen.headword
where not exists (select 1 from public.exercises e where e.vocabulary_item_id = v.id and e.type = 'mcq');

${fixes.join("\n")}
-- Check: words per topic after the seed.
select t.slug, count(*) as words
from public.vocabulary_items v join public.topics t on t.id = v.topic_id
where t.slug in (${slugs.map(q).join(", ")}) and v.status = 'published'
group by t.slug order by t.slug;
`;
writeFileSync(new URL("../supabase/seed/059_vocab_expansion.sql", import.meta.url), sql);
console.log(`wrote 059 with ${rows.length} words`);
