import { describe, expect, it } from "vitest";
import { collectionPageJsonLd, learningResourceJsonLd, webPageJsonLd } from "./structuredData";
import { jsonLdHtml } from "./breadcrumbs";

const trail = [
  { name: "Saylo", path: "/" },
  { name: "דקדוק באנגלית", path: "/english-grammar" },
];

describe("structured data", () => {
  it("marks a topic page as a Hebrew lesson at its level, linked to the site's org", () => {
    const ld = learningResourceJsonLd({
      name: "Present simple",
      description: "הסבר",
      path: "/english-grammar/present-simple",
      level: "A1",
      resourceType: "Grammar lesson",
      teaches: "English grammar: Present simple",
      trail,
    });
    const [lesson, crumbs] = ld["@graph"];
    expect(lesson).toMatchObject({
      "@type": "LearningResource",
      url: "https://www.saylolearn.com/english-grammar/present-simple",
      inLanguage: "he",
      educationalLevel: "A1",
      publisher: { "@id": "https://www.saylolearn.com/#org" },
    });
    expect(crumbs["@type"]).toBe("BreadcrumbList");
  });

  it("lists a hub's topics in order, and leaves the list out when there is none", () => {
    const withItems = collectionPageJsonLd({
      name: "hub",
      description: "d",
      path: "/english-grammar",
      items: [{ name: "a", path: "/english-grammar/a" }, { name: "b", path: "/english-grammar/b" }],
      trail,
    })["@graph"][0] as { mainEntity: { numberOfItems: number; itemListElement: { position: number; url: string }[] } };
    expect(withItems.mainEntity.numberOfItems).toBe(2);
    expect(withItems.mainEntity.itemListElement[1]).toMatchObject({ position: 2, url: "https://www.saylolearn.com/english-grammar/b" });

    const empty = collectionPageJsonLd({ name: "hub", description: "d", path: "/english-idioms", items: [], trail })["@graph"][0];
    expect(empty).not.toHaveProperty("mainEntity");
  });

  it("can't be used to close the script tag", () => {
    const html = jsonLdHtml(webPageJsonLd({ name: "</script><b>", description: "d", path: "/try", trail }));
    expect(html).not.toContain("</script>");
  });
});
