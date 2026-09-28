import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getUser,
  isPaidServer,
  createMessage,
  conversationMaybeSingle,
  messagesOrder,
  scoreSingle,
  conversationsUpdateEq,
  profileMaybeSingle,
  recordPatternObservations,
} = vi.hoisted(() => ({
  getUser: vi.fn(),
  isPaidServer: vi.fn(),
  createMessage: vi.fn(),
  conversationMaybeSingle: vi.fn(),
  messagesOrder: vi.fn(),
  scoreSingle: vi.fn(),
  conversationsUpdateEq: vi.fn(),
  profileMaybeSingle: vi.fn(),
  recordPatternObservations: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: (table: string) => {
      if (table === "conversations") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: conversationMaybeSingle }) }) }),
          update: () => ({ eq: conversationsUpdateEq }),
        };
      }
      if (table === "conversation_messages") {
        return { select: () => ({ eq: () => ({ order: messagesOrder }) }) };
      }
      if (table === "conversation_scores") {
        return { upsert: () => ({ select: () => ({ single: scoreSingle }) }) };
      }
      if (table === "profiles") {
        return { select: () => ({ eq: () => ({ maybeSingle: profileMaybeSingle }) }) };
      }
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

vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPaidServer }));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));
vi.mock("@/lib/ai/reportParseFailure", () => ({ reportAiParseFailure: vi.fn() }));
vi.mock("@/lib/assessment/skillLevel", () => ({ setSkillLevelFromScore: vi.fn() }));
vi.mock("@/lib/patterns/recordObservations", () => ({ recordPatternObservations }));

import { POST } from "./route";

function request(body?: unknown) {
  return new Request("http://localhost/api/ai/conversation-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const AI_JSON = JSON.stringify({
  fluencyScore: 70,
  grammarScore: 60,
  vocabularyScore: 65,
  overallScore: 65,
  grammarMistakes: [],
  overusedWords: [],
  suggestedVocabulary: [],
  generalSuggestionsHe: "כל הכבוד",
  patterns: [{ code: "MISSING_COPULA", quote: "she happy today" }],
});

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({
    data: { user: { id: "user-1", user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } } },
  });
  isPaidServer.mockResolvedValue(true);
  conversationMaybeSingle.mockResolvedValue({ data: { id: "conv-1", profile_id: "user-1" } });
  messagesOrder.mockResolvedValue({
    data: [
      { role: "user", content: "she happy today" },
      { role: "assistant", content: "Great! Tell me more." },
    ],
  });
  scoreSingle.mockResolvedValue({ data: { id: "score-1", overall_score: 65 }, error: null });
  conversationsUpdateEq.mockResolvedValue({ error: null });
  profileMaybeSingle.mockResolvedValue({ data: { age_band: "adult" } });
  createMessage.mockResolvedValue({ text: AI_JSON, usage: { input_tokens: 10, output_tokens: 20 } });
});

describe("POST /api/ai/conversation-score", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(request({ conversationId: "conv-1" }));
    expect(res.status).toBe(401);
  });

  it("rejects a learner who has not agreed to AI sharing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: {} } } });
    const res = await POST(request({ conversationId: "conv-1" }));
    expect(res.status).toBe(403);
  });

  it("records only the student's turns as the pattern source text, never the AI's replies", async () => {
    const res = await POST(request({ conversationId: "conv-1" }));
    expect(res.status).toBe(200);
    expect(recordPatternObservations).toHaveBeenCalledExactlyOnceWith({
      profileId: "user-1",
      ageBand: "adult",
      source: "conversation",
      sourceId: "conv-1",
      sourceText: "she happy today",
      rawAiPatterns: [{ code: "MISSING_COPULA", quote: "she happy today" }],
    });
  });

  it("does not record patterns when there is no profile row", async () => {
    profileMaybeSingle.mockResolvedValue({ data: null });
    await POST(request({ conversationId: "conv-1" }));
    expect(recordPatternObservations).not.toHaveBeenCalled();
  });

  it("joins multiple student turns with newlines", async () => {
    messagesOrder.mockResolvedValue({
      data: [
        { role: "user", content: "first turn" },
        { role: "assistant", content: "ok" },
        { role: "user", content: "second turn" },
      ],
    });
    await POST(request({ conversationId: "conv-1" }));
    expect(recordPatternObservations).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ sourceText: "first turn\nsecond turn" })
    );
  });
});
