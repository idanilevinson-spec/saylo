import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it("keeps paths on this site", () => {
    expect(safeNext("/vocabulary/food?x=1")).toBe("/vocabulary/food?x=1");
  });
  it("falls back when missing", () => {
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext("", "/reset-password/confirm")).toBe("/reset-password/confirm");
  });
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "@evil.com", "evil.com", "javascript:alert(1)"])(
    "rejects %s",
    (v) => {
      expect(safeNext(v)).toBe("/dashboard");
    },
  );
});
