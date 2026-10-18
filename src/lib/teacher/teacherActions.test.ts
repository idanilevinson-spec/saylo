import { describe, expect, it } from "vitest";
import { buildTeacherActions } from "./teacherActions";

describe("buildTeacherActions", () => {
  it("turns real data into one-tap steps", () => {
    expect(
      buildTeacherActions({
        weakTopics: [{ nameHe: "Present Perfect", slug: "present-perfect" }],
        dueWords: 12,
        daysSinceConversation: 5,
      }),
    ).toEqual([
      { kind: "grammar", label: "לחזור על Present Perfect", href: "/grammar/present-perfect" },
      { kind: "review", label: "12 מילים מחכות לחזרה", href: "/review" },
      { kind: "conversation", label: "שיחה קצרה עם המורה", href: "/speaking" },
    ]);
  });

  it("says 'one word' for one word, and skips a conversation they just had", () => {
    expect(buildTeacherActions({ weakTopics: [], dueWords: 1, daysSinceConversation: 0 })).toEqual([
      { kind: "review", label: "מילה אחת מחכה לחזרה", href: "/review" },
    ]);
  });

  it("invents nothing for a quiet account except the first conversation", () => {
    expect(buildTeacherActions({ weakTopics: [], dueWords: 0, daysSinceConversation: 1 })).toEqual([]);
    expect(buildTeacherActions({ weakTopics: [], dueWords: 0, daysSinceConversation: null })).toHaveLength(1);
  });
});
