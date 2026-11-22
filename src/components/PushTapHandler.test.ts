import { describe, expect, it, vi } from "vitest";

vi.mock("@capacitor/core", () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { pushTargetPath } from "./PushTapHandler";

describe("pushTargetPath", () => {
  it("follows paths on this site", () => {
    expect(pushTargetPath("/admin/support?request=abc")).toBe("/admin/support?request=abc");
  });
  it("ignores other sites, protocol-relative links and junk", () => {
    expect(pushTargetPath("https://evil.example")).toBeNull();
    expect(pushTargetPath("//evil.example")).toBeNull();
    expect(pushTargetPath("javascript:alert(1)")).toBeNull();
    expect(pushTargetPath(undefined)).toBeNull();
    expect(pushTargetPath(42)).toBeNull();
  });
});
