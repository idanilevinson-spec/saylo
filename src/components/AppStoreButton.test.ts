import { afterEach, describe, expect, it, vi } from "vitest";

const { isNative } = vi.hoisted(() => ({ isNative: vi.fn(() => false) }));
vi.mock("@capacitor/core", () => ({ Capacitor: { isNativePlatform: isNative } }));

import { isAppleMobileWeb } from "./AppStoreButton";

function device(userAgent: string, maxTouchPoints = 0) {
  vi.stubGlobal("navigator", { userAgent, maxTouchPoints });
}

afterEach(() => {
  vi.unstubAllGlobals();
  isNative.mockReturnValue(false);
});

describe("isAppleMobileWeb", () => {
  it("shows the App Store button on iPhone and iPad browsers, including Instagram's", () => {
    device("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 350.0");
    expect(isAppleMobileWeb()).toBe(true);
    device("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15", 5);
    expect(isAppleMobileWeb()).toBe(true); // iPad in desktop mode
  });

  it("hides it on Android, desktop and inside the app itself", () => {
    device("Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36");
    expect(isAppleMobileWeb()).toBe(false);
    device("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15", 0);
    expect(isAppleMobileWeb()).toBe(false);
    device("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148");
    isNative.mockReturnValue(true);
    expect(isAppleMobileWeb()).toBe(false);
  });
});
