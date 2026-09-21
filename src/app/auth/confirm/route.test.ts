import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyOtp } = vi.hoisted(() => ({ verifyOtp: vi.fn() }));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { verifyOtp } }),
}));

import { GET } from "./route";

function call(query: string) {
  return GET(new Request(`https://www.saylolearn.com/auth/confirm?${query}`));
}

function location(res: Response) {
  return res.headers.get("location");
}

beforeEach(() => {
  vi.resetAllMocks();
  verifyOtp.mockResolvedValue({ error: null });
});

describe("GET /auth/confirm", () => {
  it("verifies a reset link on the server and sends the learner to choose a new password", async () => {
    const res = await call("token_hash=abc&type=recovery&next=/reset-password/confirm");
    expect(verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: "abc" });
    expect(location(res)).toBe("https://www.saylolearn.com/reset-password/confirm");
  });

  it("defaults a reset link to the new-password page when no next is given", async () => {
    const res = await call("token_hash=abc&type=recovery");
    expect(location(res)).toBe("https://www.saylolearn.com/reset-password/confirm");
  });

  it("never redirects off the site, whatever next says", async () => {
    for (const next of ["https://evil.example", "//evil.example", "/\\evil.example", "evil"]) {
      const res = await call(`token_hash=abc&type=recovery&next=${encodeURIComponent(next)}`);
      expect(location(res)).toBe("https://www.saylolearn.com/reset-password/confirm");
    }
  });

  it("sends a failed reset link to the reset page, which explains it", async () => {
    verifyOtp.mockResolvedValue({ error: { message: "expired" } });
    const res = await call("token_hash=abc&type=recovery");
    expect(location(res)).toBe("https://www.saylolearn.com/reset-password/confirm");
  });

  it("sends a failed sign-up link to the login page", async () => {
    verifyOtp.mockResolvedValue({ error: { message: "expired" } });
    const res = await call("token_hash=abc&type=signup");
    expect(location(res)).toBe("https://www.saylolearn.com/login");
  });

  it("does nothing without a token or with a type it does not accept", async () => {
    expect(location(await call("type=recovery"))).toBe("https://www.saylolearn.com/reset-password/confirm");
    expect(location(await call("token_hash=abc&type=magiclink"))).toBe("https://www.saylolearn.com/login");
    expect(location(await call("token_hash=abc"))).toBe("https://www.saylolearn.com/login");
    expect(verifyOtp).not.toHaveBeenCalled();
  });
});
