import { describe, expect, it } from "vitest";
import { isMicPermissionDeniedError } from "./micPermission";

describe("isMicPermissionDeniedError", () => {
  it("recognizes Azure's own denial errors", () => {
    expect(isMicPermissionDeniedError(new Error("NotAllowedError: Permission denied"))).toBe(true);
    expect(isMicPermissionDeniedError("Permission denied by system")).toBe(true);
  });

  it("does not treat an unrelated error as a permission denial", () => {
    expect(isMicPermissionDeniedError(new Error("Network connection failed"))).toBe(false);
    expect(isMicPermissionDeniedError("Timed out")).toBe(false);
  });
});
