import { describe, expect, it } from "vitest";
import type { SkillArea } from "@/types/database";
import { partAt, placementParts } from "./parts";

// The live bank (19.11.2026): grammar and vocabulary alternate for 24
// questions, then 6 reading, then 6 listening.
const LIVE: SkillArea[] = [
  ...Array.from({ length: 24 }, (_, i): SkillArea => (i % 4 < 2 ? "grammar" : "vocabulary")),
  ...Array<SkillArea>(6).fill("reading"),
  ...Array<SkillArea>(6).fill("listening"),
];

describe("placementParts", () => {
  it("makes three parts of the live bank", () => {
    expect(placementParts(LIVE)).toEqual([
      { label: "מילים ודקדוק", start: 0, size: 24 },
      { label: "קריאה", start: 24, size: 6 },
      { label: "האזנה", start: 30, size: 6 },
    ]);
  });

  it("finds the part of a question", () => {
    const parts = placementParts(LIVE);
    expect(partAt(parts, 0)).toMatchObject({ number: 1 });
    expect(partAt(parts, 24)).toMatchObject({ number: 2, part: { label: "קריאה" } });
    expect(partAt(parts, 35)).toMatchObject({ number: 3 });
    expect(partAt(parts, 36)).toBeNull();
  });
});
