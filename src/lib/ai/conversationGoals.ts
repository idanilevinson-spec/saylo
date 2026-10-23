// Missions in a role-play: three things the learner sets out to do in the
// scenario ("order a drink", "ask for the bill"), shown as a checklist that
// ticks as they are done. The teacher knows them, steers the scene so the
// learner gets the chance, and after each reply says which are done so far
// on one machine line that is removed before anyone sees or hears the reply
// (the same way as the correction line).

export const GOALS_MARKER = "GOALS:";

export interface ScenarioObjective {
  he: string;
  en: string;
}

export function buildGoalsNote(objectives: ScenarioObjective[], done: number[]): string {
  const list = objectives.map((o, i) => `${i + 1}. ${o.en}${done.includes(i) ? " (done)" : ""}`).join("\n");
  return `In this role-play the learner has ${objectives.length} missions, shown to them as a checklist:
${list}
Give them natural chances to do the open ones, roughly in order, the way the scene would really go. Never list the missions, never tell them what to say, and don't mention a checklist.
At the very end of every reply, after any correction line, add one line in exactly this form, which the app removes before anyone sees or hears your reply: ${GOALS_MARKER} followed by the numbers of every mission the learner has completed so far, judged only from the learner's own messages, for example "${GOALS_MARKER} 1,2", or "${GOALS_MARKER}" with nothing after it if none. A mission counts as done when the learner did it in English, even with small mistakes; asking how to say it in Hebrew does not count.`;
}

// Removes every missions line from a reply and reads the last one: the
// zero-based indexes of the missions done, or null when there was no line.
export function splitGoalsLine(raw: string, count: number): { text: string; goals: number[] | null } {
  let goals: number[] | null = null;
  const kept: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t.startsWith(GOALS_MARKER)) {
      kept.push(line);
      continue;
    }
    goals = [
      ...new Set(
        (t.slice(GOALS_MARKER.length).match(/\d+/g) ?? [])
          .map(Number)
          .filter((n) => n >= 1 && n <= count)
          .map((n) => n - 1),
      ),
    ].sort((a, b) => a - b);
  }
  return { text: kept.join("\n"), goals };
}

// A mission, once done, stays done.
export function mergeDone(previous: number[], now: number[] | null): number[] {
  return [...new Set([...previous, ...(now ?? [])])].sort((a, b) => a - b);
}

export function cleanObjectives(raw: unknown): ScenarioObjective[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((o): o is ScenarioObjective => !!o && typeof o.he === "string" && typeof o.en === "string" && !!o.he.trim() && !!o.en.trim())
    .slice(0, 5);
}
