import type { BagrutUnitProgress } from "@/types/database";
import type { BagrutModuleCode } from "./moduleFormats";
import { getPublishableSampleUnits } from "./sampleUnits";
import { STRONG_PERCENT } from "@/lib/bagrut/examPlan";

// Pure helpers that keep a learner from getting lost in a practice set:
// which paragraph a question points at (so the question card can show it
// right there), and which set to do next.

export interface ParagraphRef {
  // 0-based passage (module A has two texts) and 1-based paragraph, as the
  // numbers printed in the margin.
  passage: number;
  paragraph: number;
}

const ORDINAL: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6 };

// "paragraph 3", "Text 2, paragraph 5", "the last paragraph", "the first
// paragraph". Null when the question names no paragraph or one that
// doesn't exist.
export function paragraphRef(promptEn: string, paragraphCounts: number[]): ParagraphRef | null {
  const text = promptEn.toLowerCase();
  const passage = Number(text.match(/\btext (\d+)\b/)?.[1] ?? 1) - 1;
  const count = paragraphCounts[passage];
  if (!count) return null;
  let paragraph: number | null = null;
  const numbered = text.match(/\bparagraph (\d+)\b/);
  if (numbered) paragraph = Number(numbered[1]);
  else if (/\b(last|final) paragraph\b/.test(text)) paragraph = count;
  else {
    const word = text.match(/\b(first|second|third|fourth|fifth|sixth) paragraph\b/)?.[1];
    if (word) paragraph = ORDINAL[word];
  }
  if (paragraph === null || paragraph < 1 || paragraph > count) return null;
  return { passage, paragraph };
}

// A passage split into the paragraphs the page prints and numbers.
export function splitParagraphs(passage: string): string[] {
  return passage
    .split(/(?:\r?\n){2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export interface SetRef {
  code: BagrutModuleCode;
  slug: string;
}

// The set to do next, across the given questionnaires in order: the first
// one never done, then the weakest one below a strong score. Null when
// every set is done well.
export function nextSet(codes: BagrutModuleCode[], progress: BagrutUnitProgress[]): SetRef | null {
  const sets = codes.flatMap((code) => getPublishableSampleUnits(code).map((u) => ({ code, slug: u.unitSlug })));
  const best = (s: SetRef) => progress.find((p) => p.module_code === s.code && p.unit_slug === s.slug)?.best_percent ?? null;
  const fresh = sets.find((s) => best(s) === null);
  if (fresh) return fresh;
  const weak = sets.filter((s) => (best(s) ?? 0) < STRONG_PERCENT).sort((a, b) => (best(a) ?? 0) - (best(b) ?? 0));
  return weak[0] ?? null;
}
