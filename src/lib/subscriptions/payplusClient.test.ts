import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// "server-only" throws unconditionally outside Next's RSC build (see
// node_modules/server-only/index.js) — harmless to stub here since this test
// never runs in a real client bundle.
vi.mock("server-only", () => ({}));

const { isValidPayplusCallback } = await import("./payplusClient");

const SECRET = "test-secret-key";
const originalEnv = process.env.PAYPLUS_SECRET_KEY;

beforeEach(() => {
  process.env.PAYPLUS_SECRET_KEY = SECRET;
});

afterEach(() => {
  process.env.PAYPLUS_SECRET_KEY = originalEnv;
});

function hashFor(body: string, secret = SECRET) {
  return createHmac("sha256", secret).update(body).digest("base64");
}

describe("isValidPayplusCallback", () => {
  it("accepts a correctly signed body", () => {
    const body = JSON.stringify({ status_code: "000" });
    expect(isValidPayplusCallback(body, hashFor(body))).toBe(true);
  });

  it("rejects a body that was tampered with after signing", () => {
    const body = JSON.stringify({ status_code: "000" });
    const hash = hashFor(body);
    const tampered = JSON.stringify({ status_code: "999" });
    expect(isValidPayplusCallback(tampered, hash)).toBe(false);
  });

  it("rejects a hash signed with the wrong secret", () => {
    const body = JSON.stringify({ status_code: "000" });
    expect(isValidPayplusCallback(body, hashFor(body, "someone-elses-secret"))).toBe(false);
  });

  it("rejects a missing hash header", () => {
    const body = JSON.stringify({ status_code: "000" });
    expect(isValidPayplusCallback(body, null)).toBe(false);
  });
});
