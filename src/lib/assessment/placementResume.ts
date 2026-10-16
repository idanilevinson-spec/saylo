// Where an unfinished placement test picks up: right after the last
// question answered, in the test's own order. Skipped questions aren't
// recorded, so one skipped before that point stays skipped; one skipped
// after it (just before the learner left) comes up again. Null when there
// is nothing to resume.
export function placementResumePoint(
  questionIds: string[],
  answeredIds: Iterable<string>
): { answered: number; nextIndex: number } | null {
  const answered = new Set(answeredIds);
  if (answered.size === 0) return null;
  const lastAnswered = questionIds.reduce((last, id, i) => (answered.has(id) ? i : last), -1);
  if (lastAnswered < 0) return null;
  return { answered: answered.size, nextIndex: lastAnswered + 1 };
}
