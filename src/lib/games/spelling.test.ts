import { describe, expect, it } from "vitest";
import { clozeSentence } from "./spelling";

describe("clozeSentence", () => {
  it("blanks the word, whatever its case", () => {
    expect(clozeSentence("Her salary went up this year.", "salary")).toBe("Her _____ went up this year.");
    expect(clozeSentence("Salary day is Friday.", "salary")).toBe("_____ day is Friday.");
  });

  it("blanks a multi-word phrase", () => {
    expect(clozeSentence("I take a shower every morning.", "take a shower")).toBe("I _____ every morning.");
  });

  it("keeps a regular ending visible so the headword still fits", () => {
    expect(clozeSentence("The company has two hundred employees.", "employee")).toBe("The company has two hundred _____s.");
    expect(clozeSentence("She resigned last week.", "resign")).toBe("She _____ed last week.");
    expect(clozeSentence("He is working late.", "work")).toBe("He is _____ing late.");
  });

  it("only matches the word, not part of another one", () => {
    expect(clozeSentence("He is unemployed.", "employed")).toBeNull();
    expect(clozeSentence("They came to an agreement.", "agree")).toBeNull();
  });

  it("gives up with no example, or an inflected phrase", () => {
    expect(clozeSentence(null, "resign")).toBeNull();
    expect(clozeSentence("She gets up early on weekdays.", "get up")).toBeNull();
  });
});
