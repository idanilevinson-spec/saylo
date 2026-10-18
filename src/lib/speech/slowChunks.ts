// "Say it slowly": the teacher's last line, re-read slower and in short
// pieces with a pause after each, the way a teacher repeats a sentence for
// someone who didn't catch it. Pieces are sentences, and long sentences
// are cut again at commas so no piece runs past a breath.

const MAX_WORDS = 7;

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

export function splitIntoChunks(text: string): string[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const chunks: string[] = [];
  for (const sentence of sentences) {
    if (words(sentence) <= MAX_WORDS) {
      chunks.push(sentence);
      continue;
    }
    // Cut at commas, then join short neighbours back so a piece isn't
    // a lonely "well," or "yesterday,".
    let current = "";
    for (const part of sentence.split(/(?<=,)\s+/)) {
      const next = current ? `${current} ${part}` : part;
      if (current && words(next) > MAX_WORDS && words(current) >= 3) {
        chunks.push(current);
        current = part;
      } else {
        current = next;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// One synthesis for the whole slow reading: a bookmark before each piece
// tells the player when that piece starts, so the caption can light it up.
export function buildSlowSsml(chunks: string[], voiceName: string): string {
  const body = chunks.map((c, i) => `<bookmark mark="${i}"/>${escapeXml(c)}<break time="700ms"/>`).join("");
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${escapeXml(voiceName)}"><prosody rate="-25%">${body}</prosody></voice></speak>`;
}

// Which piece is playing at `seconds`, given when each one starts.
export function activeChunkAt(starts: number[], seconds: number): number {
  let active = 0;
  for (let i = 0; i < starts.length; i++) if (starts[i] <= seconds) active = i;
  return active;
}
