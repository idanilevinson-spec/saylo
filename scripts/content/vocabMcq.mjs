// The multiple-choice question every vocabulary word needs: the daily
// review (src/lib/srs/queue.ts) drops any word that has no published mcq
// exercise. Same shape as the existing ones:
// { prompt: 'מה המילה באנגלית עבור "<Hebrew>"?', options: [4 headwords], correctIndex }.
// Wrong options come from the same topic, never a word whose Hebrew is the
// same or too close (TOO_CLOSE). Deterministic, so re-running gives the
// same questions.
import { TOO_CLOSE } from "./vocabExpansion.mjs";

function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

const close = new Set(TOO_CLOSE.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));

// topicWords: every published word in the topic, old and new: [{ headword, he }].
export function buildMcq(word, topicWords) {
  const pool = topicWords
    .filter((w) => w.headword !== word.headword && w.he !== word.he && !close.has(`${w.headword}|${word.headword}`))
    .sort((a, b) => hash(word.headword + a.headword) - hash(word.headword + b.headword));
  if (pool.length < 3) throw new Error(`${word.headword}: fewer than 3 wrong options`);
  const wrong = pool.slice(0, 3).map((w) => w.headword);
  const correctIndex = hash(word.headword) % 4;
  const options = [...wrong];
  options.splice(correctIndex, 0, word.headword);
  return { prompt: `מה המילה באנגלית עבור "${word.he}"?`, options, correctIndex };
}
