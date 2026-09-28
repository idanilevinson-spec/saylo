import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getUser,
  isPremiumServer,
  createMessage,
  promptMaybeSingle,
  submissionSingle,
  feedbackSingle,
  profileMaybeSingle,
  recordPatternObservations,
} = vi.hoisted(() => ({
  getUser: vi.fn(),
  isPremiumServer: vi.fn(),
  createMessage: vi.fn(),
  promptMaybeSingle: vi.fn(),
  submissionSingle: vi.fn(),
  feedbackSingle: vi.fn(),
  profileMaybeSingle: vi.fn(),
  recordPatternObservations: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: (table: string) => {
      if (table === "writing_prompts") return { select: () => ({ eq: () => ({ maybeSingle: promptMaybeSingle }) }) };
      if (table === "writing_submissions") return { insert: () => ({ select: () => ({ single: submissionSingle }) }) };
      if (table === "writing_feedback") return { insert: () => ({ select: () => ({ single: feedbackSingle }) }) };
      if (table === "profiles") return { select: () => ({ eq: () => ({ maybeSingle: profileMaybeSingle }) }) };
      throw new Error(`unexpected table: ${table}`);
    },
  }),
}));

vi.mock("@/lib/ai/claudeClient", () => ({
  anthropic: { messages: { create: createMessage } },
  CLAUDE_MODEL: "test-model",
  extractText: (m: { text: string }) => m.text,
  parseJsonResponse: (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
}));

vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPremiumServer }));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));
vi.mock("@/lib/ai/reportParseFailure", () => ({ reportAiParseFailure: vi.fn() }));
vi.mock("@/lib/assessment/skillLevel", () => ({ setSkillLevelFromScore: vi.fn() }));
vi.mock("@/lib/patterns/recordObservations", () => ({ recordPatternObservations }));

import { POST } from "./route";

function request(body?: unknown) {
  return new Request("http://localhost/api/ai/writing-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const AI_JSON = JSON.stringify({
  overallScore: 80,
  feedbackHe: "טוב מאוד",
  improvedVersion: "She is happy today.",
  patterns: [{ code: "MISSING_COPULA", quote: "she happy today" }],
});

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({
    data: { user: { id: "user-1", user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } } },
  });
  isPremiumServer.mockResolvedValue(true);
  promptMaybeSingle.mockResolvedValue({ data: { id: "prompt-1", prompt_en: "Describe your day", cefr_level: "A2" } });
  submissionSingle.mockResolvedValue({ data: { id: "sub-1" }, error: null });
  feedbackSingle.mockResolvedValue({ data: { id: "fb-1", overall_score: 80 }, error: null });
  profileMaybeSingle.mockResolvedValue({ data: { age_band: "adult" } });
  createMessage.mockResolvedValue({ text: AI_JSON, usage: { input_tokens: 10, output_tokens: 20 } });
});

describe("POST /api/ai/writing-coach", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(request({ writingPromptId: "p1", submittedText: "she happy today" }));
    expect(res.status).toBe(401);
  });

  it("rejects a learner who has not agreed to AI sharing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: {} } } });
    const res = await POST(request({ writingPromptId: "p1", submittedText: "she happy today" }));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "ai consent required" });
  });

  it("requires an active premium subscription", async () => {
    isPremiumServer.mockResolvedValue(false);
    const res = await POST(request({ writingPromptId: "p1", submittedText: "she happy today" }));
    expect(res.status).toBe(403);
  });

  it("records the AI-tagged patterns for an adult after a successful submission", async () => {
    const res = await POST(request({ writingPromptId: "p1", submittedText: "she happy today" }));
    expect(res.status).toBe(200);
    expect(recordPatternObservations).toHaveBeenCalledExactlyOnceWith({
      profileId: "user-1",
      ageBand: "adult",
      source: "writing",
      sourceId: "sub-1",
      sourceText: "she happy today",
      rawAiPatterns: [{ code: "MISSING_COPULA", quote: "she happy today" }],
    });
  });

  it("does not record patterns when there is no profile row", async () => {
    profileMaybeSingle.mockResolvedValue({ data: null });
    await POST(request({ writingPromptId: "p1", submittedText: "she happy today" }));
    expect(recordPatternObservations).not.toHaveBeenCalled();
  });

  it("still returns feedback when the AI response fails to parse, without recording garbage patterns", async () => {
    createMessage.mockResolvedValue({ text: "not json", usage: { input_tokens: 1, output_tokens: 1 } });
    const res = await POST(request({ writingPromptId: "p1", submittedText: "she happy today" }));
    expect(res.status).toBe(200);
    expect(recordPatternObservations).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ rawAiPatterns: undefined })
    );
  });
});
