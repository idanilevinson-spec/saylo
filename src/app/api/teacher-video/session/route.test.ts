import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, isPremiumServer, underDailyAiLimit, logAiUsage } = vi.hoisted(() => ({
  getUser: vi.fn(),
  isPremiumServer: vi.fn(),
  underDailyAiLimit: vi.fn(),
  logAiUsage: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({ createClient: async () => ({ auth: { getUser } }) }));
vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPremiumServer }));
vi.mock("@/lib/ai/dailyLimit", () => ({ underDailyAiLimit, DAILY_LIMIT_ERROR: "daily ai limit reached" }));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage }));

import { POST } from "./route";

function call(voice: string = "female") {
  return POST(new Request("http://localhost/api/teacher-video/session", { method: "POST", body: JSON.stringify({ voice }) }));
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  process.env.SIMLI_API_KEY = "simli-key";
  process.env.SIMLI_FACE_FEMALE = "face-f";
  process.env.SIMLI_FACE_MALE = "face-m";
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  isPremiumServer.mockResolvedValue(true);
  underDailyAiLimit.mockResolvedValue(true);
  logAiUsage.mockResolvedValue(undefined);
  fetchMock.mockImplementation(async (url: string) =>
    url.endsWith("/compose/token")
      ? { ok: true, json: async () => ({ session_token: "tok" }) }
      : { ok: true, json: async () => [{ urls: ["turn:example"] }] },
  );
  vi.stubGlobal("fetch", fetchMock);
});

describe("POST /api/teacher-video/session", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await call()).status).toBe(401);
  });

  it("says not configured (404) without a key or a face, so the call keeps the illustrated teacher", async () => {
    delete process.env.SIMLI_FACE_MALE;
    expect((await call("male")).status).toBe(404);
    delete process.env.SIMLI_API_KEY;
    expect((await call("female")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires premium and respects the daily cap", async () => {
    isPremiumServer.mockResolvedValue(false);
    expect((await call()).status).toBe(403);
    isPremiumServer.mockResolvedValue(true);
    underDailyAiLimit.mockResolvedValue(false);
    expect((await call()).status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("opens a capped session with the face for the chosen voice; the key stays on the server", async () => {
    const res = await call("male");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ sessionToken: "tok", iceServers: [{ urls: ["turn:example"] }] });
    expect(JSON.stringify(body)).not.toContain("simli-key");
    const [, init] = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/compose/token"))!;
    const config = JSON.parse(init.body);
    expect(config.faceId).toBe("face-m");
    expect(config.maxSessionLength).toBeLessThanOrEqual(15 * 60);
    expect(init.headers["x-simli-api-key"]).toBe("simli-key");
    expect(logAiUsage).toHaveBeenCalledWith(expect.anything(), "user-1", "teacher_video", 0, 0);
  });

  it("reports the provider failing as 502", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    expect((await call()).status).toBe(502);
  });
});
