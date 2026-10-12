import { describe, expect, it } from "vitest";
import { placementInstructionHe } from "./instructionHe";

describe("placementInstructionHe", () => {
  it.each([
    ["She ___ a teacher.", "בחרו את מה שמשלים את המשפט"],
    ['What is the English word for "כלב"?', "בחרו את המילה באנגלית שמתאימה למילה בעברית"],
    ["Choose the correct color: The sky is ___.", "בחרו את הצבע שמשלים את המשפט"],
    ['What is the opposite of "big"?', 'בחרו את ההפך של "big"'],
    ['Choose the correct synonym for "happy":', 'בחרו מילה שהמשמעות שלה דומה ל-"happy"'],
    ['What does "give up" mean?', 'מה הפירוש של "give up"?'],
    ['What does the idiom "to read between the lines" mean?', 'מה הפירוש של הביטוי "to read between the lines"?'],
    ['Choose the word closest in meaning to "meticulous":', 'בחרו את הפירוש הקרוב ביותר ל-"meticulous"'],
    ['Read: "Tom has a small dog." Question: What color is Tom\'s dog?', "קראו את הקטע וענו על השאלה"],
    ["Listen and answer: What is the girl's name?", "האזינו לקטע וענו על השאלה"],
    ["Choose the correct word: The meeting was ___ due to bad weather.", "בחרו את מה שמשלים את המשפט"],
  ])("%s", (prompt, expected) => {
    expect(placementInstructionHe(prompt)).toBe(expected);
  });

  it("returns null for a shape it doesn't know", () => {
    expect(placementInstructionHe("Describe your weekend.")).toBeNull();
  });
});
