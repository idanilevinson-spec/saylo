// Pure pieces of the long-answer recorder (useLongAnswerRecognition), kept
// apart so they are unit-tested without a microphone.

// Azure hands continuous recognition back as finished phrases; the answer is
// those phrases in order, with the empty ones (silence) dropped.
export function joinSegments(segments: string[]): string {
  return segments
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

// Whole seconds since the recording started, never past the cap.
export function elapsedSeconds(startedAt: number, now: number, maxSeconds: number): number {
  return Math.min(maxSeconds, Math.max(0, Math.floor((now - startedAt) / 1000)));
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
