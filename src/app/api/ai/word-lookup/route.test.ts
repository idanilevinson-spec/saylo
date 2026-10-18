import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, maybeSingle, from, isPaidServer, create, extractText, ilike } = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
  isPaidServer: vi.fn(),
  create: vi.fn(),
  extractText: vi.fn(),
  ilike: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser }, from }),
}));
vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPaidServer }));
vi.mock("@/lib/ai/claudeClient", () => ({
  anthropic: { messages: { create } },
  CLAUDE_MODEL: "test-model",
  extractText,
  parseJsonResponse: (raw: string) => JSON.parse(raw),
}));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));

import { POST } from "./route";

const request = (word: string, sentence = "Was it very crowded at the beach?") =>
  new Request("http://localhost/api/ai/word-lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, sentence }),
  });

// The catalog, keyed by headword; srs rows by vocabulary item id.
let catalog: Record<string, { id: string; headword: string; translation_he: string; part_of_speech: string }> = {};
let mySrs: string[] = [];

beforeEach(() => {
  vi.resetAllMocks();
  catalog = { crowded: { id: "v1", headword: "crowded", translation_he: "צפוף", part_of_speech: "adjective" } };
  mySrs = [];
  getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } } } });
  isPaidServer.mockResolvedValue(true);
  create.mockResolvedValue({ usage: { input_tokens: 1, output_tokens: 1 } });
  from.mockImplementation((table: string) => {
    let headword = "";
    let itemId = "";
    const chain = {
      select: () => chain,
      eq: (col: string, val: string) => {
        if (col === "vocabulary_item_id") itemId = val;
        return chain;
      },
      ilike: (_col: string, val: string) => {
        ilike(val);
        headword = val;
        return chain;
      },
      limit: () => chain,
      maybeSingle: () => {
        if (table === "profiles") return maybeSingle();
        if (table === "vocabulary_items") return Promise.resolve({ data: catalog[headword] ?? null });
        if (table === "srs_items") return Promise.resolve({ data: mySrs.includes(itemId) ? { id: "s1" } : null });
        return Promise.resolve({ data: null });
      },
    };
    return chain;
  });
  maybeSingle.mockResolvedValue({ data: { age_band: "adult", parental_consent_status: "not_required" } });
});

describe("POST /api/ai/word-lookup", () => {
  it("is for paying learners only", async () => {
    isPaidServer.mockResolvedValue(false);
    expect((await POST(request("crowded"))).status).toBe(403);
  });

  it("rejects anything that is not one English word", async () => {
    for (const w of ["קבלה", "two words", ""]) expect((await POST(request(w))).status).toBe(400);
  });

  it("answers a catalog word from the catalog, without the AI", async () => {
    mySrs = ["v1"];
    const body = await (await POST(request("Crowded"))).json();
    expect(body).toMatchObject({ headword: "crowded", translationHe: "צפוף", vocabularyItemId: "v1", inMyWords: true });
    expect(create).not.toHaveBeenCalled();
  });

  it("asks the AI for other words, and offers the catalog item for its base form", async () => {
    catalog.arrive = { id: "v2", headword: "arrive", translation_he: "להגיע", part_of_speech: "verb" };
    extractText.mockReturnValue(JSON.stringify({ lemma: "arrive", he: "להגיע", pos: "verb" }));
    const body = await (await POST(request("arrived", "When we arrived it was full."))).json();
    expect(create).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({ word: "arrived", headword: "arrive", translationHe: "להגיע", vocabularyItemId: "v2", inMyWords: false });
  });

  it("explains a word that is not in the catalog, with nothing to add", async () => {
    extractText.mockReturnValue(JSON.stringify({ lemma: "pursue", he: "לעסוק ב", pos: "verb" }));
    const body = await (await POST(request("pursue", "I want to pursue marketing."))).json();
    expect(body).toMatchObject({ headword: "pursue", translationHe: "לעסוק ב", vocabularyItemId: null });
  });

  it("never lets a % or _ in the word act as a wildcard", async () => {
    extractText.mockReturnValue(JSON.stringify({ lemma: "it's", he: "זה", pos: "other" }));
    await POST(request("it's"));
    expect(ilike.mock.calls.every(([v]) => !/[%_]/.test(v))).toBe(true);
  });
});
