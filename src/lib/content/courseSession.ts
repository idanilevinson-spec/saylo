// The unit a learner stepped out of, so the page a step opens (a grammar
// topic, a reading, a conversation) can offer the way back to it. Per tab,
// in sessionStorage: it only means something during this sitting.

export interface ActiveUnit {
  id: string;
  number: number;
  level: string;
  titleHe: string;
  // Paths of the unit's steps, without query strings.
  paths: string[];
  // What finishes each step, by path (courseStepText.ts), for the return
  // bar to state on the step's own page.
  goals?: Record<string, string>;
}

const KEY = "saylo:course-unit";

export function setActiveUnit(unit: ActiveUnit) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(unit));
  } catch {
    // Private mode or blocked storage: the bar just won't show.
  }
}

export function getActiveUnit(): ActiveUnit | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActiveUnit) : null;
  } catch {
    return null;
  }
}

export function clearActiveUnit() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing stored to clear.
  }
}

// "/speaking" covers "/speaking/chat/…" but not "/speaking-test".
export function pathInUnit(pathname: string, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function stepPath(href: string): string {
  return href.split("?")[0];
}
