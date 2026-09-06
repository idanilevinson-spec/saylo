// Fisher-Yates shuffle, shared by every vocabulary game that needs to
// randomize a word pool or an option list (was previously duplicated
// separately in each game file).
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deterministic Fisher-Yates keyed by an arbitrary seed string, for cases
// that need a *different* order on a different day (so a user practicing
// the same exercise set repeatedly sees genuine variety) but the *same*
// order across multiple requests within that day (so a multi-page exercise
// sequence, where each page independently re-fetches and re-derives its
// own position and "next" link from the shared sibling order, stays
// internally consistent instead of desyncing on every navigation).
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  let state = hashSeed(seed);
  for (let i = a.length - 1; i > 0; i--) {
    state = nextRandom(state);
    const j = state % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A seed that changes once per calendar day (UTC), for use with seededShuffle
// on content the user might repeat within a single practice session.
export function dailySeed(...parts: string[]): string {
  return [...parts, new Date().toISOString().slice(0, 10)].join(":");
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function nextRandom(state: number): number {
  let h = state;
  h ^= h << 13;
  h >>>= 0;
  h ^= h >>> 17;
  h ^= h << 5;
  return h >>> 0;
}
