import { describe, it, expect } from "vitest";
import { sm2, nextDueDate, SM2_INITIAL_STATE } from "./sm2";

describe("sm2", () => {
  it("sets a 1-day interval on the first correct answer", () => {
    const result = sm2(SM2_INITIAL_STATE, true);
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
  });

  it("sets a 6-day interval on the second consecutive correct answer", () => {
    const afterFirst = sm2(SM2_INITIAL_STATE, true);
    const afterSecond = sm2(afterFirst, true);
    expect(afterSecond.repetitions).toBe(2);
    expect(afterSecond.intervalDays).toBe(6);
  });

  it("multiplies the interval by the ease factor from the third correct answer onward", () => {
    let state = SM2_INITIAL_STATE;
    state = sm2(state, true);
    state = sm2(state, true);
    const before = state;
    state = sm2(state, true);
    expect(state.repetitions).toBe(3);
    expect(state.intervalDays).toBe(Math.round(before.intervalDays * before.easeFactor));
  });

  it("resets repetitions and interval to 1 day on an incorrect answer", () => {
    let state = SM2_INITIAL_STATE;
    state = sm2(state, true);
    state = sm2(state, true);
    state = sm2(state, false);
    expect(state.repetitions).toBe(0);
    expect(state.intervalDays).toBe(1);
  });

  it("never lowers the ease factor below 1.3", () => {
    let state = SM2_INITIAL_STATE;
    for (let i = 0; i < 30; i++) {
      state = sm2(state, false);
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("increases the ease factor on repeated correct answers", () => {
    let state = SM2_INITIAL_STATE;
    state = sm2(state, true);
    const easeAfterOne = state.easeFactor;
    state = sm2(state, true);
    expect(state.easeFactor).toBeGreaterThan(easeAfterOne);
  });
});

describe("nextDueDate", () => {
  it("adds the given number of days to the reference date", () => {
    const from = new Date(2026, 5, 15, 12, 0, 0);
    const due = nextDueDate(6, from);
    const expected = new Date(2026, 5, 21, 12, 0, 0);
    expect(due.getTime()).toBe(expected.getTime());
  });

  it("returns the same date for a 0-day interval", () => {
    const from = new Date(2026, 5, 15, 12, 0, 0);
    const due = nextDueDate(0, from);
    expect(due.getTime()).toBe(from.getTime());
  });
});
