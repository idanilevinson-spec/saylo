import { describe, expect, it } from "vitest";
import { CARD_PLACEHOLDER, ID_PLACEHOLDER, redactSensitiveNumbers } from "./redact";

describe("redactSensitiveNumbers", () => {
  it("removes a card number, with or without separators", () => {
    // 4242 4242 4242 4242 is Stripe's published test card and passes Luhn.
    for (const card of ["4242424242424242", "4242 4242 4242 4242", "4242-4242-4242-4242"]) {
      const result = redactSensitiveNumbers(`חויבתי פעמיים בכרטיס ${card} למה?`);
      expect(result.redacted).toBe(true);
      expect(result.text).toBe(`חויבתי פעמיים בכרטיס ${CARD_PLACEHOLDER} למה?`);
    }
  });

  it("removes a 9-digit ID number", () => {
    const result = redactSensitiveNumbers("תעודת זהות 123456782");
    expect(result).toEqual({ text: `תעודת זהות ${ID_PLACEHOLDER}`, redacted: true });
  });

  it("keeps phone numbers, prices and dates — they belong to real questions", () => {
    for (const text of ["תתקשרו ל-0501234567", "שילמתי 449 ש״ח", "ב-02.10.2026 נכשל התשלום", "מספר הפנייה A1B2C3D4"]) {
      expect(redactSensitiveNumbers(text)).toEqual({ text, redacted: false });
    }
  });

  it("keeps a long digit run that isn't a valid card number", () => {
    const text = "קוד שגיאה 1234567890123456";
    expect(redactSensitiveNumbers(text)).toEqual({ text, redacted: false });
  });
});
