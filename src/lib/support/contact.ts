// Validation for the "have someone get back to me" form, shared by the form
// (instant feedback while typing) and the API route (the real check).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

// Returns the number in a single canonical form, or null when it isn't a
// plausible phone number. Israeli numbers are the common case and become
// +972…; anything already in international form (+ and 8–15 digits) is
// accepted as is, for the occasional user abroad.
export function normalizePhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, "");
  if (/^\+\d{8,15}$/.test(compact)) {
    // +972 0 5x… is a common way to write it; drop the trunk zero.
    return compact.replace(/^\+9720/, "+972");
  }
  if (/^00\d{8,15}$/.test(compact)) return `+${compact.slice(2)}`.replace(/^\+9720/, "+972");
  // Israeli mobile (05X + 7 digits) or landline (0X + 7 digits, X = 2-4, 8, 9, or 7X VoIP).
  if (/^05\d{8}$/.test(compact) || /^07\d{8}$/.test(compact) || /^0[23489]\d{7}$/.test(compact)) {
    return `+972${compact.slice(1)}`;
  }
  return null;
}

// For display to a person (admin screen, email): +972501234567 → 050-123-4567.
export function formatPhoneForDisplay(phone: string): string {
  const m = /^\+972(5\d|7\d)(\d{3})(\d{4})$/.exec(phone);
  if (m) return `0${m[1]}-${m[2]}-${m[3]}`;
  return phone;
}

// wa.me wants digits only, international form, no plus.
export function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
