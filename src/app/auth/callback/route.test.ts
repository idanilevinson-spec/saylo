import { beforeEach, describe, expect, it, vi } from "vitest";

const { exchangeCodeForSession } = vi.hoisted(() => ({ exchangeCodeForSession: vi.fn() }));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

import { GET } from "./route";
import { signupRedirectUrl } from "@/lib/auth/safeNext";

const call = (query: string) => GET(new Request(`https://www.saylolearn.com/auth/callback?${query}`));
const location = (res: Response) => res.headers.get("location");

beforeEach(() => {
  vi.resetAllMocks();
  exchangeCodeForSession.mockResolvedValue({ error: null });
});

describe("GET /auth/callback", () => {
  it("signs in with the code and continues to next", async () => {
    const res = await call("code=abc&next=/dashboard");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(location(res)).toBe("https://www.saylolearn.com/dashboard");
  });

  it("sends a link that can't sign in here to the login page with the reason, so it can explain", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("code verifier missing") });
    expect(location(await call("code=abc&next=/dashboard"))).toBe("https://www.saylolearn.com/login?reason=link");
    expect(location(await call("error=access_denied&error_code=otp_expired"))).toBe("https://www.saylolearn.com/login?reason=link");
  });

  it("never continues off the site", async () => {
    expect(location(await call("code=abc&next=//evil.example"))).toBe("https://www.saylolearn.com/dashboard");
  });

  it("is where a sign-up confirmation link returns", () => {
    expect(signupRedirectUrl("https://www.saylolearn.com")).toBe("https://www.saylolearn.com/auth/callback?next=/dashboard");
  });
});
