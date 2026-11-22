import type { SkillArea } from "@/types/database";

// The level test shown in parts instead of one long count ("שאלה 1 מתוך
// 36"): learners left at question 1 (17.11.2026), 2 (8.10) and 19 (27.9).
// Questions come in sort_order; consecutive questions of the same part
// form one part. Vocabulary and grammar alternate in the bank, so they
// are one part, "מילים ודקדוק". The test's length does not change.
export interface PlacementPart {
  label: string;
  start: number; // index of its first question
  size: number;
}

const PART_LABEL: Partial<Record<SkillArea, string>> = {
  vocabulary: "מילים ודקדוק",
  grammar: "מילים ודקדוק",
  reading: "קריאה",
  listening: "האזנה",
};

export function placementParts(skills: SkillArea[]): PlacementPart[] {
  const parts: PlacementPart[] = [];
  skills.forEach((skill, i) => {
    const label = PART_LABEL[skill] ?? skill;
    const last = parts[parts.length - 1];
    if (last && last.label === label) last.size += 1;
    else parts.push({ label, start: i, size: 1 });
  });
  return parts;
}

export function partAt(parts: PlacementPart[], index: number): { part: PlacementPart; number: number } | null {
  const i = parts.findIndex((p) => index >= p.start && index < p.start + p.size);
  return i === -1 ? null : { part: parts[i], number: i + 1 };
}
