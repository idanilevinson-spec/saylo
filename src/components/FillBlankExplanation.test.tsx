import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FillBlankExplanation from "./FillBlankExplanation";

describe("FillBlankExplanation", () => {
  it("shows the whole sentence with the answer in place, and the rule", () => {
    const html = renderToStaticMarkup(
      <FillBlankExplanation content={{ sentence: "___ you ever tried Ethiopian food?", correctAnswer: "Have", hint: "ניסיון בחיים" }} />,
    );
    expect(html).toContain("<strong");
    expect(html).toMatch(/>Have<\/strong> you ever tried Ethiopian food\?/);
    expect(html).toContain("למה:");
    expect(html).toContain("ניסיון בחיים");
  });

  it("leaves out the rule when the item has no hint", () => {
    const html = renderToStaticMarkup(<FillBlankExplanation content={{ sentence: "I ___ tired.", correctAnswer: "am" }} />);
    expect(html).toContain("I <strong");
    expect(html).not.toContain("למה:");
  });
});
