// A mixed set of questions from two pools (a topic's words and its
// grammar), as even a split as the pools allow, shuffled. Pure: the unit
// check and the public taster lesson both draw with it.
export function pickCheckQuestions<T>(vocab: T[], grammar: T[], count: number, random = Math.random): T[] {
  const shuffle = (items: T[]) => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const a = shuffle(vocab);
  const b = shuffle(grammar);
  // Half from each when both have enough; the other side fills any gap.
  const fromGrammar = Math.min(b.length, Math.max(count - a.length, Math.ceil(count / 2)));
  const fromVocab = Math.min(a.length, count - fromGrammar);
  return shuffle([...a.slice(0, fromVocab), ...b.slice(0, fromGrammar)]);
}
