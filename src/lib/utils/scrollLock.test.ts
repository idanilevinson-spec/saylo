import { beforeEach, describe, expect, it } from "vitest";
import { acquireBodyScrollLock } from "./scrollLock";

// The suite runs in node, so a bare stand-in for document.body is enough:
// the lock only ever reads and writes body.style.overflow.
const body = { style: { overflow: "" } };
(globalThis as unknown as { document: unknown }).document = { body };

describe("acquireBodyScrollLock", () => {
  beforeEach(() => {
    body.style.overflow = "";
  });

  it("locks, then restores the value it found", () => {
    body.style.overflow = "auto";
    const release = acquireBodyScrollLock();
    expect(body.style.overflow).toBe("hidden");
    release();
    expect(body.style.overflow).toBe("auto");
  });

  it("stays locked until the last of two overlapping locks is released (menu closed first)", () => {
    const releaseMenu = acquireBodyScrollLock();
    const releaseChat = acquireBodyScrollLock();
    releaseMenu();
    expect(body.style.overflow).toBe("hidden");
    releaseChat();
    expect(body.style.overflow).toBe("");
  });

  it("stays locked until the last of two overlapping locks is released (chat closed first)", () => {
    const releaseMenu = acquireBodyScrollLock();
    const releaseChat = acquireBodyScrollLock();
    releaseChat();
    expect(body.style.overflow).toBe("hidden");
    releaseMenu();
    expect(body.style.overflow).toBe("");
  });

  it("ignores a second release of the same lock", () => {
    const releaseMenu = acquireBodyScrollLock();
    const releaseChat = acquireBodyScrollLock();
    releaseMenu();
    releaseMenu();
    expect(body.style.overflow).toBe("hidden");
    releaseChat();
    expect(body.style.overflow).toBe("");
  });
});
