import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getClaims, profileMaybeSingle, placementMaybeSingle } = vi.hoisted(() => ({
  getClaims: vi.fn(),
  profileMaybeSingle: vi.fn(),
  placementMaybeSingle: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getClaims },
    from: (table: string) => {
      if (table === "profiles") return { select: () => ({ eq: () => ({ maybeSingle: profileMaybeSingle }) }) };
      if (table === "placement_tests") {
        return { select: () => ({ eq: () => ({ eq: () => ({ limit: () => ({ maybeSingle: placementMaybeSingle }) }) }) }) };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  }),
}));

import { proxy } from "./proxy";

function request(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

function redirectPathname(res: Response): string | null {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname : null;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } } });
  profileMaybeSingle.mockResolvedValue({ data: { is_admin: false } });
  placementMaybeSingle.mockResolvedValue({ data: { id: "test-1" } }); // completed
});

describe("proxy", () => {
  it("lets an unprotected path through without touching Supabase", async () => {
    const res = await proxy(request("/pricing"));
    expect(redirectPathname(res)).toBeNull();
    expect(getClaims).not.toHaveBeenCalled();
  });

  it("redirects to /login, preserving the destination, when there is no session", async () => {
    getClaims.mockResolvedValue({ data: { claims: null } });
    const res = await proxy(request("/dashboard"));
    expect(redirectPathname(res)).toBe("/login");
    expect(new URL(res.headers.get("location")!).searchParams.get("next")).toBe("/dashboard");
  });

  it("sends a signed-in learner who hasn't completed placement to /placement", async () => {
    placementMaybeSingle.mockResolvedValue({ data: null });
    const res = await proxy(request("/dashboard"));
    expect(redirectPathname(res)).toBe("/placement");
  });

  it("lets a signed-in learner who completed placement through", async () => {
    const res = await proxy(request("/dashboard"));
    expect(redirectPathname(res)).toBeNull();
  });

  it.each(["/games", "/progress", "/patterns", "/speaking-test", "/vocabulary", "/writing", "/mistakes", "/bagrut"])(
    "gates %s behind placement completion too",
    async (path) => {
      placementMaybeSingle.mockResolvedValue({ data: null });
      const res = await proxy(request(path));
      expect(redirectPathname(res)).toBe("/placement");
    }
  );

  it("never redirects away from /placement itself, even without a completed test", async () => {
    placementMaybeSingle.mockResolvedValue({ data: null });
    const res = await proxy(request("/placement"));
    expect(redirectPathname(res)).toBeNull();
  });

  it("keeps /profile reachable without a completed placement test", async () => {
    placementMaybeSingle.mockResolvedValue({ data: null });
    const res = await proxy(request("/profile"));
    expect(redirectPathname(res)).toBeNull();
  });

  it("redirects a non-admin away from /admin without ever checking placement", async () => {
    const res = await proxy(request("/admin"));
    expect(redirectPathname(res)).toBe("/dashboard");
    expect(placementMaybeSingle).not.toHaveBeenCalled();
  });

  it("lets an admin into /admin without checking placement", async () => {
    profileMaybeSingle.mockResolvedValue({ data: { is_admin: true } });
    const res = await proxy(request("/admin"));
    expect(redirectPathname(res)).toBeNull();
    expect(placementMaybeSingle).not.toHaveBeenCalled();
  });
});
