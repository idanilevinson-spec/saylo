export interface HeartsState {
  current: number;
  max: number;
  lastRegenAt: Date;
}

export const REGEN_INTERVAL_MS = 4 * 60 * 60 * 1000; // one heart every 4 hours

// While at max, lastRegenAt is kept pinned to `now` so no backlog silently
// accumulates during the time a user is already full.
export function regenerateHearts(state: HeartsState, now: Date): HeartsState {
  if (state.current >= state.max) {
    return { ...state, lastRegenAt: now };
  }

  const elapsedMs = now.getTime() - state.lastRegenAt.getTime();
  const heartsToAdd = Math.floor(elapsedMs / REGEN_INTERVAL_MS);
  if (heartsToAdd <= 0) return state;

  const current = Math.min(state.max, state.current + heartsToAdd);
  const remainderMs = elapsedMs % REGEN_INTERVAL_MS;
  const lastRegenAt = new Date(now.getTime() - remainderMs);

  return { current, max: state.max, lastRegenAt };
}

// Losing a heart from full starts the regen clock; losing one while already
// below max doesn't reset progress toward the next regenerated heart.
export function loseHeart(state: HeartsState, now: Date): HeartsState {
  if (state.current <= 0) return state;
  const wasFull = state.current >= state.max;
  return {
    current: state.current - 1,
    max: state.max,
    lastRegenAt: wasFull ? now : state.lastRegenAt,
  };
}
