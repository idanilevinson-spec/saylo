// Turns a headword into a partially-masked hint string for the Spelling
// Challenge game, e.g. "elephant" -> "e_ep_a_t". Deterministic per word
// (not per render) so the same question doesn't re-shuffle its blanks
// if the component re-renders.
export function maskWord(word: string): string {
  const chars = word.split("");
  const maskableIndices: number[] = [];
  chars.forEach((c, i) => {
    // Never mask spaces, and never mask a single-letter "word" inside a
    // phrase (e.g. the "a" in "take a shower") - masking it adds
    // ambiguity without adding challenge.
    if (c === " ") return;
    const isWordChar = /[a-zA-Z]/.test(c);
    if (!isWordChar) return;
    const prevIsSpace = i === 0 || chars[i - 1] === " ";
    const nextIsSpace = i === chars.length - 1 || chars[i + 1] === " ";
    if (prevIsSpace && nextIsSpace) return; // single-letter word
    maskableIndices.push(i);
  });

  if (maskableIndices.length === 0) return word;

  const blankCount = Math.max(1, Math.round(maskableIndices.length * 0.4));

  // Simple deterministic PRNG seeded by the word itself, so the same
  // headword always masks the same positions.
  let seed = 0;
  for (let i = 0; i < word.length; i++) seed = (seed * 31 + word.charCodeAt(i)) | 0;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const shuffled = [...maskableIndices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const blankSet = new Set(shuffled.slice(0, blankCount));

  return chars.map((c, i) => (blankSet.has(i) ? "_" : c)).join("");
}

export function checkSpelling(userInput: string, correctWord: string): boolean {
  return userInput.trim().toLowerCase() === correctWord.trim().toLowerCase();
}
