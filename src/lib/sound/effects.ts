// Zero-cost UI feedback sounds via the Web Audio API — no audio files to
// host or license, matching the same "no asset, no backend" spirit as
// browserTts.ts. Lazily creates one shared AudioContext and reuses it
// across calls, since browsers cap how many can exist at once and every
// call here already happens inside a user-gesture (answer submit).
let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, volume: number): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playCorrectSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.12, 0.13); // C5
  playTone(ctx, 659.25, now + 0.09, 0.15, 0.13); // E5
}

export function playIncorrectSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 220, now, 0.22, 0.1); // A3 — soft, not harsh
}

export function playLevelUpSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 392.0, now, 0.1, 0.12); // G4
  playTone(ctx, 523.25, now + 0.08, 0.1, 0.12); // C5
  playTone(ctx, 659.25, now + 0.16, 0.2, 0.15); // E5
}

export function playCompleteSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.13, 0.13); // C5
  playTone(ctx, 659.25, now + 0.1, 0.13, 0.13); // E5
  playTone(ctx, 783.99, now + 0.2, 0.13, 0.13); // G5
  playTone(ctx, 1046.5, now + 0.3, 0.28, 0.15); // C6
}
