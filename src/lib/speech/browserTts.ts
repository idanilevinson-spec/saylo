// Zero-cost audio via the browser's built-in Web Speech API, no API key
// and no file hosting. Used for single words (pronunciation buttons, word
// games) and as the fallback when Azure's neural voice isn't available.
export function speak(text: string, rate = 1, onEnd?: () => void): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
