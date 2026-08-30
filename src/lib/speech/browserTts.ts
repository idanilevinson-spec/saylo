// Zero-cost audio via the browser's built-in Web Speech API — no API key,
// no file hosting. Used for word pronunciation, reading read-along, and
// listening/dictation exercises. Swappable later for a real TTS/recording
// provider (see src/lib/speech/provider.ts, added in a later phase) without
// touching callers — they just call speak().
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
