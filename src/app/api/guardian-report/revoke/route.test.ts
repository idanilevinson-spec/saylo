import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, inChain } = vi.hoisted(() => ({
  getUser: vi.fn(),
  inChain: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

vi.mock("@/lib/supabase/adminClient", () => ({
  supabaseAdmin: {
    from: () => ({ update: () => ({ eq: () => ({ in: inChain }) }) }),
  },
}));

import { POST } from "./route";

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "kid-1" } } });
  inChain.mockResolvedValue({ error: null });
});

describe("POST /api/guardian-report/revoke", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST()).status).toBe(401);
    expect(inChain).not.toHaveBeenCalled();
  });

  it("marks the minor's consent revoked", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(inChain).toHaveBeenCalledExactlyOnceWith("status", ["pending", "granted"]);
  });

  it("returns 500 on a database error", async () => {
    inChain.mockResolvedValue({ error: new Error("boom") });
    expect((await POST()).status).toBe(500);
  });
});
