import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, maybeSingle, from, isPaidServer, create, extractText, ilike, findLearnerWord, saveLearnerWord } = vi.hoisted(() => ({
  findLearnerWord: vi.fn(),
  saveLearnerWord: vi.fn(),
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
  isPaidServer: vi.fn(),
  create: vi.fn(),
  extractText: vi.fn(),
  ilike: vi.fn(),
}));

// Background work runs straight away in tests, so its effects can be checked.
const { pendingAfter } = vi.hoisted(() => ({ pendingAfter: [] as Promise<unknown>[] }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (fn: () => unknown) => {
    pendingAfter.push(Promise.resolve(fn()));
  },
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
vi.mock("@/lib/vocabulary/learnerWords", () => ({ findLearnerWord, saveLearnerWord }));

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
  findLearnerWord.mockResolvedValue(null);
  saveLearnerWord.mockResolvedValue(null);
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

  it("adds a word that is nowhere yet to the learner words, so it can be reviewed", async () => {
    extractText.mockReturnValue(
      JSON.stringify({ lemma: "pursue", he: "לעסוק ב", pos: "verb", level: "B2", distractors: ["avoid", "borrow", "repair"] }),
    );
    const body = await (await POST(request("pursue", "I want to pursue marketing."))).json();
    await Promise.all(pendingAfter);
    // Answered with the id the word is then stored under, after the response.
    expect(saveLearnerWord).toHaveBeenCalledWith(
      expect.objectContaining({ lemma: "pursue", level: "B2" }),
      "I want to pursue marketing.",
      body.vocabularyItemId,
    );
    expect(body).toMatchObject({ headword: "pursue", translationHe: "לעסוק ב", inMyWords: false });
    expect(body.vocabularyItemId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("reuses a word another learner already added", async () => {
    extractText.mockReturnValue(
      JSON.stringify({ lemma: "tacit", he: "משתמע", pos: "adjective", level: "C1", distractors: ["loud", "brief", "eager"] }),
    );
    findLearnerWord.mockResolvedValue("lw2");
    const body = await (await POST(request("tacit", "It is tacit."))).json();
    expect(saveLearnerWord).not.toHaveBeenCalled();
    expect(body.vocabularyItemId).toBe("lw2");
  });

  it("explains a name without storing it", async () => {
    extractText.mockReturnValue(JSON.stringify({ lemma: "dana", he: "דנה (שם)", pos: "name", level: "A1", distractors: ["a", "b", "c"] }));
    const body = await (await POST(request("Dana", "Nice to meet you, Dana."))).json();
    expect(saveLearnerWord).not.toHaveBeenCalled();
    expect(body).toMatchObject({ translationHe: "דנה (שם)", vocabularyItemId: null });
  });

  it("never lets a % or _ in the word act as a wildcard", async () => {
    extractText.mockReturnValue(JSON.stringify({ lemma: "it's", he: "זה", pos: "other" }));
    await POST(request("it's"));
    expect(ilike.mock.calls.every(([v]) => !/[%_]/.test(v))).toBe(true);
  });
});
