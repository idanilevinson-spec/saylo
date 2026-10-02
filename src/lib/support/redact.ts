// Strips the sensitive numbers people sometimes paste into a support chat
// ("here's my card, why was I charged twice?") before the message is stored
// or sent to the AI provider. The assistant is told to say it was removed,
// so the person learns not to send it again.
//
// Deliberately narrow: only a digit run that passes the Luhn check (a real
// card number shape) or a 9-digit run (an Israeli ID number shape) is
// replaced. Phone numbers (10 digits, starting 05) and order amounts are
// left alone — removing them would break legitimate questions.

export const CARD_PLACEHOLDER = "[מספר כרטיס הוסר]";
export const ID_PLACEHOLDER = "[מספר מזהה הוסר]";

function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

// Digit runs that may be broken up by spaces or dashes, as cards usually are.
const DIGIT_RUN = /\d(?:[ -]?\d){8,22}/g;

export function redactSensitiveNumbers(text: string): { text: string; redacted: boolean } {
  let redacted = false;
  const result = text.replace(DIGIT_RUN, (match) => {
    const digits = match.replace(/[ -]/g, "");
    if (digits.length >= 13 && digits.length <= 19 && passesLuhn(digits)) {
      redacted = true;
      return CARD_PLACEHOLDER;
    }
    if (digits.length === 9 && !digits.startsWith("0")) {
      redacted = true;
      return ID_PLACEHOLDER;
    }
    return match;
  });
  return { text: result, redacted };
}
