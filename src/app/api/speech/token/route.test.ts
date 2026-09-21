import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, maybeSingle, isPremiumServer } = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  isPremiumServer: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPremiumServer }));

import { GET } from "./route";

function call(query = "") {
  return GET(new Request(`http://localhost/api/speech/token${query}`));
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  process.env.AZURE_SPEECH_KEY = "key";
  process.env.AZURE_SPEECH_REGION = "westeurope";
  getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } } } });
  isPremiumServer.mockResolvedValue(true);
  maybeSingle.mockResolvedValue({ data: { age_band: "adult", parental_consent_status: "not_required" } });
  fetchMock.mockResolvedValue({ ok: true, text: async () => "azure-token" });
  vi.stubGlobal("fetch", fetchMock);
});

describe("GET /api/speech/token AI-sharing consent", () => {
  it("refuses recognition (the learner's voice) until they have agreed to share it", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: {} } } });
    const res = await call();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "ai consent required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still allows text-to-speech, which only reads out fixed lesson text", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: {} } } });
    expect((await call("?purpose=tts")).status).toBe(200);
  });
});

describe("GET /api/speech/token", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await call()).status).toBe(401);
  });

  it("still requires premium", async () => {
    isPremiumServer.mockResolvedValue(false);
    expect((await call()).status).toBe(403);
  });

  it("issues a token to an adult for recognition", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ token: "azure-token", region: "westeurope" });
  });

  it("refuses a minor without granted consent, including a bare call with no purpose", async () => {
    maybeSingle.mockResolvedValue({ data: { age_band: "child", parental_consent_status: "pending" } });
    for (const query of ["", "?purpose=recognition", "?purpose=anything"]) {
      const res = await call(query);
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "parental consent required" });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets a minor without consent use text-to-speech only", async () => {
    maybeSingle.mockResolvedValue({ data: { age_band: "teen", parental_consent_status: "not_required" } });
    expect((await call("?purpose=tts")).status).toBe(200);
  });

  it("issues a recognition token to a minor once consent is granted", async () => {
    maybeSingle.mockResolvedValue({ data: { age_band: "child", parental_consent_status: "granted" } });
    expect((await call()).status).toBe(200);
  });

  it("refuses recognition when the profile row is missing", async () => {
    maybeSingle.mockResolvedValue({ data: null });
    expect((await call()).status).toBe(403);
    expect((await call("?purpose=tts")).status).toBe(200);
  });
});
