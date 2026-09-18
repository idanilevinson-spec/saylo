import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, maybeSingle, deleteUser, retrieve, cancel } = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  deleteUser: vi.fn(),
  retrieve: vi.fn(),
  cancel: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

vi.mock("@/lib/supabase/adminClient", () => ({
  supabaseAdmin: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
    auth: { admin: { deleteUser } },
  },
}));

vi.mock("@/lib/subscriptions/stripeClient", () => ({
  stripe: { subscriptions: { retrieve, cancel } },
}));

import { POST } from "./route";

function request(body?: unknown) {
  return new Request("http://localhost/api/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  maybeSingle.mockResolvedValue({ data: null });
  deleteUser.mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/account/delete", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(request({ confirm: true }));
    expect(res.status).toBe(401);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("requires explicit confirmation", async () => {
    expect((await POST(request({}))).status).toBe(400);
    expect((await POST(request())).status).toBe(400);
    expect((await POST(request({ confirm: "true" }))).status).toBe(400);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("deletes only the caller's own account", async () => {
    const res = await POST(request({ confirm: true }));
    expect(res.status).toBe(200);
    expect(deleteUser).toHaveBeenCalledExactlyOnceWith("user-1");
  });

  it("cancels an active Stripe subscription before deleting", async () => {
    maybeSingle.mockResolvedValue({ data: { stripe_subscription_id: "sub_1", billing_provider: "stripe" } });
    retrieve.mockResolvedValue({ status: "active" });
    cancel.mockResolvedValue({});

    const res = await POST(request({ confirm: true }));

    expect(res.status).toBe(200);
    expect(cancel).toHaveBeenCalledWith("sub_1");
    expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(deleteUser.mock.invocationCallOrder[0]);
  });

  it("keeps the account if Stripe cancellation fails", async () => {
    maybeSingle.mockResolvedValue({ data: { stripe_subscription_id: "sub_1", billing_provider: "stripe" } });
    retrieve.mockResolvedValue({ status: "active" });
    cancel.mockRejectedValue(new Error("stripe down"));

    const res = await POST(request({ confirm: true }));

    expect(res.status).toBe(502);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("skips cancelling a Stripe subscription that is already canceled", async () => {
    maybeSingle.mockResolvedValue({ data: { stripe_subscription_id: "sub_1", billing_provider: "stripe" } });
    retrieve.mockResolvedValue({ status: "canceled" });

    const res = await POST(request({ confirm: true }));

    expect(res.status).toBe(200);
    expect(cancel).not.toHaveBeenCalled();
    expect(deleteUser).toHaveBeenCalled();
  });

  it("does not touch Stripe for an Apple subscriber", async () => {
    maybeSingle.mockResolvedValue({ data: { stripe_subscription_id: null, billing_provider: "apple" } });

    const res = await POST(request({ confirm: true }));

    expect(res.status).toBe(200);
    expect(retrieve).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
  });

  it("reports a failure when the user cannot be deleted", async () => {
    deleteUser.mockResolvedValue({ error: { message: "boom" } });
    const res = await POST(request({ confirm: true }));
    expect(res.status).toBe(500);
  });
});
