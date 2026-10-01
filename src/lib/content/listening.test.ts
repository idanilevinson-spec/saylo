import { describe, expect, it, vi } from "vitest";
import type { ListeningClip } from "@/types/database";

// groupListeningClipsByStyle is pure, but it lives in a module that also
// exports Supabase-backed I/O functions — mocked here purely so importing
// the module doesn't throw for missing env vars, the same pattern used for
// other pure functions extracted alongside I/O (e.g. computeNextStreak).
vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: vi.fn(),
}));

import { groupListeningClipsByStyle } from "./listening";

function makeClip(overrides: Partial<ListeningClip>): ListeningClip {
  return {
    id: "clip-1",
    title_he: "כותרת",
    title_en: "Title",
    transcript_en: "Some transcript.",
    cefr_level: "B1",
    status: "published",
    style: "standard",
    sort_order: 1,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("groupListeningClipsByStyle", () => {
  it("splits clips into standard and natural-speech buckets", () => {
    const standard = makeClip({ id: "a", style: "standard" });
    const natural = makeClip({ id: "b", style: "natural_speech" });

    const { standard: standardOut, naturalSpeech } = groupListeningClipsByStyle([standard, natural]);

    expect(standardOut).toEqual([standard]);
    expect(naturalSpeech).toEqual([natural]);
  });

  it("treats an empty list as both buckets empty", () => {
    expect(groupListeningClipsByStyle([])).toEqual({ standard: [], naturalSpeech: [] });
  });

  it("keeps original order within each bucket", () => {
    const clips = [
      makeClip({ id: "1", style: "natural_speech" }),
      makeClip({ id: "2", style: "standard" }),
      makeClip({ id: "3", style: "natural_speech" }),
    ];

    const { standard, naturalSpeech } = groupListeningClipsByStyle(clips);

    expect(standard.map((c) => c.id)).toEqual(["2"]);
    expect(naturalSpeech.map((c) => c.id)).toEqual(["1", "3"]);
  });
});
