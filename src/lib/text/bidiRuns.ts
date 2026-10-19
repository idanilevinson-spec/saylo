// Hebrew sentences that quote English ("שימוש בהווה פשוט: 'I work three
// years' במקום 'I have worked'") break apart when the English wraps onto a
// second line or sits next to a quote mark: the browser's bidi algorithm
// moves the quotes and splits the phrase. Cutting the text into Hebrew and
// English runs lets each English run (with its quotes) be isolated, so it
// always reads in order.

export interface TextRun {
  text: string;
  english: boolean;
}

// An English run: optional opening quote, a Latin letter, then words,
// digits and in-sentence punctuation, ending on a letter, digit or ?!. and
// an optional closing quote.
const ENGLISH_RUN = /["'“‘]?[A-Za-z](?:[A-Za-z0-9'’\-.,?!/ ]*[A-Za-z0-9.?!])?["'”’]?/g;

export function splitBidiRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let last = 0;
  for (const m of text.matchAll(ENGLISH_RUN)) {
    const start = m.index ?? 0;
    if (start > last) runs.push({ text: text.slice(last, start), english: false });
    runs.push({ text: m[0], english: true });
    last = start + m[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), english: false });
  return runs;
}
