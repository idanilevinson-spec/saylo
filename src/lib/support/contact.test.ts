import { describe, expect, it } from "vitest";
import { formatPhoneForDisplay, isValidEmail, normalizePhone, whatsappLink } from "./contact";

describe("normalizePhone", () => {
  it("turns the ways Israelis write a mobile number into one form", () => {
    for (const raw of ["0501234567", "050-123-4567", "050 1234567", "+972501234567", "+972 50-123-4567", "+9720501234567", "00972501234567"]) {
      expect(normalizePhone(raw)).toBe("+972501234567");
    }
  });

  it("accepts landlines and other countries' numbers", () => {
    expect(normalizePhone("03-1234567")).toBe("+97231234567");
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
  });

  it("rejects what can't be a phone number", () => {
    for (const raw of ["", "12345", "050123456", "abc", "05012345678901"]) {
      expect(normalizePhone(raw)).toBeNull();
    }
  });
});

describe("phone display and links", () => {
  it("shows Israeli mobiles the local way and builds a wa.me link", () => {
    expect(formatPhoneForDisplay("+972501234567")).toBe("050-123-4567");
    expect(formatPhoneForDisplay("+442079460958")).toBe("+442079460958");
    expect(whatsappLink("+972501234567")).toBe("https://wa.me/972501234567");
  });
});

describe("isValidEmail", () => {
  it("accepts real addresses and rejects broken ones", () => {
    expect(isValidEmail("name@example.com")).toBe(true);
    expect(isValidEmail("name@example")).toBe(false);
    expect(isValidEmail("name example.com")).toBe(false);
  });
});
