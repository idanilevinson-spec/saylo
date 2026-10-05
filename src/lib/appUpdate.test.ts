import { describe, expect, it } from "vitest";
import { isNewerDeploy, LONG_AWAY_MS, shouldReloadOnReturn } from "./appUpdate";

describe("isNewerDeploy", () => {
  it("is true only when the live deploy differs from the loaded one", () => {
    expect(isNewerDeploy("abc123", "def456")).toBe(true);
    expect(isNewerDeploy("abc123", "abc123")).toBe(false);
  });

  it("never reloads a local build or on a missing / malformed answer", () => {
    expect(isNewerDeploy("dev", "def456")).toBe(false);
    expect(isNewerDeploy("abc123", "dev")).toBe(false);
    expect(isNewerDeploy("abc123", "")).toBe(false);
    expect(isNewerDeploy("abc123", undefined)).toBe(false);
    expect(isNewerDeploy("abc123", 42)).toBe(false);
  });
});

describe("shouldReloadOnReturn", () => {
  it("reloads right away only after a long time away", () => {
    expect(shouldReloadOnReturn(5_000)).toBe(false);
    expect(shouldReloadOnReturn(LONG_AWAY_MS - 1)).toBe(false);
    expect(shouldReloadOnReturn(LONG_AWAY_MS)).toBe(true);
  });
});
