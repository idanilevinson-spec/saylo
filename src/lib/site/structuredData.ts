import type { CefrLevel } from "@/types/database";

// Schema.org JSON-LD for the public learning pages, so search engines know a
// topic page is a Hebrew lesson at a given CEFR level (not a sales page) and
// a hub is a collection of such lessons. Facts only: no ratings, prices or
// counts we can't stand behind. The org and site are defined once on the home
// page (#org, #website) and referenced here by @id.

const SITE = "https://www.saylolearn.com";
const ORG = { "@id": `${SITE}/#org` };
const WEBSITE = { "@id": `${SITE}/#website` };

type Crumb = { name: string; path: string };

function breadcrumbList(trail: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE}${t.path}`,
    })),
  };
}

// One lesson page: a grammar topic, a vocabulary topic or a reading text.
export function learningResourceJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  level: CefrLevel;
  resourceType: string;
  teaches: string;
  trail: Crumb[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${SITE}${opts.path}#lesson`,
        name: opts.name,
        description: opts.description,
        url: `${SITE}${opts.path}`,
        inLanguage: "he",
        learningResourceType: opts.resourceType,
        teaches: opts.teaches,
        educationalLevel: opts.level,
        audience: { "@type": "EducationalAudience", educationalRole: "student" },
        isAccessibleForFree: true,
        isPartOf: WEBSITE,
        publisher: ORG,
      },
      breadcrumbList(opts.trail),
    ],
  };
}

// A hub page that lists lessons (/english-grammar and friends).
export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  items: Crumb[];
  trail: Crumb[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE}${opts.path}#page`,
        name: opts.name,
        description: opts.description,
        url: `${SITE}${opts.path}`,
        inLanguage: "he",
        isPartOf: WEBSITE,
        publisher: ORG,
        ...(opts.items.length > 0 && {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: opts.items.length,
            itemListElement: opts.items.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: t.name,
              url: `${SITE}${t.path}`,
            })),
          },
        }),
      },
      breadcrumbList(opts.trail),
    ],
  };
}

// Any other public page (pricing, the trial lesson, the level test).
export function webPageJsonLd(opts: { name: string; description: string; path: string; trail: Crumb[] }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE}${opts.path}#page`,
        name: opts.name,
        description: opts.description,
        url: `${SITE}${opts.path}`,
        inLanguage: "he",
        isPartOf: WEBSITE,
        publisher: ORG,
      },
      breadcrumbList(opts.trail),
    ],
  };
}
