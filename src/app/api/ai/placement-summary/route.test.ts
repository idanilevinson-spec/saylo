import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, from, create, update, upsert } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser }, from }),
}));
vi.mock("@/lib/ai/claudeClient", () => ({
  anthropic: { messages: { create } },
  CLAUDE_MODEL: "test-model",
  extractText: (m: { content: { text: string }[] }) => m.content.map((b) => b.text).join("\n\n"),
  parseJsonResponse: (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
}));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));
vi.mock("@/lib/ai/reportParseFailure", () => ({ reportAiParseFailure: vi.fn() }));
vi.mock("@/lib/ai/consent", () => ({ hasAiConsent: () => true }));

import { POST } from "./route";

const request = (body: object) =>
  new Request("http://localhost/api/ai/placement-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ placementTestId: "t1", ...body }),
  });

const published = [{ skill_area: "grammar" }, { skill_area: "grammar" }, { skill_area: "vocabulary" }, { skill_area: "vocabulary" }];
let responses: { is_correct: boolean; placement_questions: { skill_area: string } }[];

const textMessage = (text: string) => ({ content: [{ type: "text", text }], usage: { input_tokens: 1, output_tokens: 1 } });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  responses = [
    { is_correct: true, placement_questions: { skill_area: "grammar" } },
    { is_correct: true, placement_questions: { skill_area: "vocabulary" } },
  ];
  update.mockReturnValue({ eq: async () => ({ error: null }) });
  upsert.mockResolvedValue({ error: null });
  from.mockImplementation((table: string) => {
    const chain = {
      select: () => chain,
      eq: (column: string) => {
        if (table === "placement_test_responses") return Promise.resolve({ data: responses });
        if (table === "placement_questions" && column === "status") return Promise.resolve({ data: published });
        return chain;
      },
      maybeSingle: async () => ({ data: table === "placement_tests" ? { id: "t1", profile_id: "user-1" } : null }),
      update,
      upsert,
    };
    return chain;
  });
});

const completed = () => update.mock.calls.find(([row]) => row.status === "completed")?.[0];

describe("POST /api/ai/placement-summary", () => {
  it("completes the test with the AI summary and writing score", async () => {
    create.mockResolvedValueOnce(textMessage('{"overallScore": 80}')).mockResolvedValueOnce(textMessage("סיכום"));
    const res = await POST(request({ writingSample: "I am Dana from Haifa." }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.summary).toBe("סיכום");
    expect(body.scores.map((s: { skill: string }) => s.skill)).toContain("writing");
    expect(completed()).toMatchObject({ status: "completed", result_summary_he: "סיכום" });
  });

  it("still completes when the AI fails, with the written-in-code summary and no writing score", async () => {
    create.mockRejectedValue(new Error("overloaded"));
    const res = await POST(request({ writingSample: "I am Dana from Haifa." }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.summary.length).toBeGreaterThan(0);
    expect(body.scores.map((s: { skill: string }) => s.skill)).not.toContain("writing");
    expect(completed()).toMatchObject({ status: "completed", result_cefr_overall: body.overallCefr });
  });

  it("gives every AI call a limit well inside the page's 30 seconds, without retries", async () => {
    create.mockResolvedValue(textMessage("{}"));
    await POST(request({ writingSample: "Hello." }));
    const limits = create.mock.calls.map(([, options]) => options);
    expect(limits).toHaveLength(2);
    for (const o of limits) expect(o).toMatchObject({ maxRetries: 0 });
    expect(limits.reduce((sum, o) => sum + o.timeout, 0)).toBeLessThan(30_000);
  });

  it("completes a test where every question was skipped instead of refusing it", async () => {
    responses = [];
    create.mockResolvedValue(textMessage("סיכום"));
    const res = await POST(request({}));
    expect(res.status).toBe(200);
    expect(completed()).toMatchObject({ status: "completed" });
  });

  it("reports an error when the completion wasn't saved, so the page offers to try again", async () => {
    create.mockResolvedValue(textMessage("סיכום"));
    update.mockReturnValue({ eq: async () => ({ error: { message: "network" } }) });
    expect((await POST(request({}))).status).toBe(500);
  });
});
