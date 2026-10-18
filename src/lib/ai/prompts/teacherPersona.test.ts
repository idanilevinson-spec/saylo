import { describe, expect, it } from "vitest";
import { buildPersonaNote, detectLearnerMood } from "./teacherPersona";

describe("detectLearnerMood", () => {
  it("is stuck when the last message is in Hebrew or asks for help", () => {
    expect(detectLearnerMood(["I like football", "אני לא יודע איך להגיד את זה"])).toBe("stuck");
    expect(detectLearnerMood(["What do you mean?"])).toBe("stuck");
    expect(detectLearnerMood(["Sorry, I don't understand"])).toBe("stuck");
  });

  it("is stuck after two very short answers", () => {
    expect(detectLearnerMood(["Yes", "Good", "Ok"])).toBe("stuck");
  });

  it("is confident after long English answers", () => {
    expect(
      detectLearnerMood([
        "I think remote work is great because I can spend more time with my family and avoid traffic.",
        "On the other hand, I sometimes miss my colleagues and the small conversations in the kitchen.",
      ]),
    ).toBe("confident");
  });

  it("is steady otherwise, and for a first message", () => {
    expect(detectLearnerMood([])).toBe("steady");
    expect(detectLearnerMood(["I went to the beach with my friends yesterday."])).toBe("steady");
  });
});

describe("buildPersonaNote", () => {
  it("picks the register for the situation", () => {
    expect(buildPersonaNote({ category: "work_professional", ageBand: "adult", mood: "steady" })).toMatch(/a little formal/);
    expect(buildPersonaNote({ category: null, ageBand: null, mood: "steady" })).toMatch(/Small talk/);
  });

  it("adds the age and the learner's state", () => {
    const note = buildPersonaNote({ category: "social", ageBand: "child", mood: "stuck" });
    expect(note).toMatch(/learner is a child/);
    expect(note).toMatch(/seems stuck/);
  });

  it("knows a learner is preparing for the Bagrut, without claims about the exam", () => {
    const note = buildPersonaNote({ category: null, ageBand: "teen", mood: "steady", bagrutUnits: 4 });
    expect(note).toContain("Bagrut exam in English (4 units)");
    expect(note).toMatch(/don't make claims about the exam itself/);
    expect(buildPersonaNote({ category: null, ageBand: "teen", mood: "steady" })).not.toMatch(/Bagrut/);
  });

  it("never uses the long dash", () => {
    for (const mood of ["stuck", "confident", "steady"] as const)
      expect(buildPersonaNote({ category: "travel", ageBand: "teen", mood })).not.toContain("—");
  });
});
