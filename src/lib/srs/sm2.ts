export interface Sm2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export const SM2_INITIAL_STATE: Sm2State = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
};

// Standard SM-2 spaced-repetition algorithm. Our exercise player only
// produces a binary correct/incorrect signal, so it's mapped onto SM-2's
// 0-5 quality scale as 5 (correct) or 2 (incorrect) rather than exposing a
// finer-grained "how hard was this" rating to the user.
export function sm2(state: Sm2State, correct: boolean): Sm2State {
  const quality = correct ? 5 : 2;
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  return { easeFactor, intervalDays, repetitions };
}

export function nextDueDate(intervalDays: number, from = new Date()): Date {
  const due = new Date(from);
  due.setDate(due.getDate() + intervalDays);
  return due;
}
