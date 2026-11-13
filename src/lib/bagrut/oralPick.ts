import { PART_A_TOPICS, PART_B_SETS, PART_C_PASSAGES, type PartATopic, type PartCPassage, type QuestionSet } from "@/lib/content/bagrutOral";

// One simulation: two Part A topics to choose from, one Part B set, one
// Part C passage. Picked when the learner presses start (in the browser,
// never during server rendering), with the random source injectable so the
// choice is testable.
export interface OralSimulation {
  partA: [PartATopic, PartATopic];
  partB: QuestionSet;
  partC: PartCPassage;
}

export function pickSimulation(random: () => number = Math.random): OralSimulation {
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length) % list.length];
  const first = pick(PART_A_TOPICS);
  const rest = PART_A_TOPICS.filter((t) => t.id !== first.id);
  return { partA: [first, pick(rest)], partB: pick(PART_B_SETS), partC: pick(PART_C_PASSAGES) };
}

// Marks which words of the improved answer are new or changed relative to
// the learner's own, by a longest-common-subsequence over words (case and
// punctuation ignored for matching, kept for display).
export function markChanges(original: string, improved: string): { word: string; changed: boolean }[] {
  const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
  const a = original.split(/\s+/).filter(Boolean).map(norm);
  const bWords = improved.split(/\s+/).filter(Boolean);
  const b = bWords.map(norm);
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] && a[i] !== "" ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: { word: string; changed: boolean }[] = [];
  let i = 0;
  let j = 0;
  while (j < b.length) {
    if (i < a.length && a[i] === b[j] && a[i] !== "") {
      out.push({ word: bWords[j], changed: false });
      i++;
      j++;
    } else if (i < a.length && dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      out.push({ word: bWords[j], changed: true });
      j++;
    }
  }
  return out;
}
