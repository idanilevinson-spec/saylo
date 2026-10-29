import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

let metadata: Record<string, unknown> = {};
vi.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({ session: { user: { id: "u1", user_metadata: metadata } }, profile: null, loading: false, refreshProfile: vi.fn() }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock("@/lib/supabase/browserClient", () => ({ supabase: {} }));

import ProfileSetupPage from "./page";

const fields = (meta: Record<string, unknown>) => {
  metadata = meta;
  const html = renderToStaticMarkup(<ProfileSetupPage />);
  const value = (id: string) => html.match(new RegExp(`id="${id}"[^>]*value="([^"]*)"`))?.[1] ?? "";
  return { name: value("setup-name"), age: value("setup-age"), html };
};

describe("profile setup", () => {
  it("fills in the nickname and age given on the sign-up form", () => {
    expect(fields({ display_name: "דנה", age: 15, terms_accepted_at: "2026-10-29" })).toMatchObject({ name: "דנה", age: "15" });
  });

  it("offers the first name from a Google or Apple full name", () => {
    expect(fields({ full_name: "Dana Cohen" }).name).toBe("Dana");
    expect(fields({ name: "  נועה לוי " }).name).toBe("נועה");
  });

  it("leaves the age empty when sign-up didn't give a usable one", () => {
    expect(fields({ age: 200 }).age).toBe("");
    expect(fields({}).age).toBe("");
  });
});
