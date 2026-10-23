import type { Metadata } from "next";

// A page-level openGraph block replaces the layout's whole openGraph object,
// so pages that set their own title and URL go through here to keep the
// site-wide fields. The image comes from the route's opengraph-image file.
export function pageOpenGraph(title: string, description: string, path: string): Metadata["openGraph"] {
  return {
    title,
    description,
    url: `https://www.saylolearn.com${path}`,
    siteName: "Saylo",
    locale: "he_IL",
    type: "website",
  };
}

// For pages with no opengraph-image file of their own. Next only attaches
// an image file to the segment it sits in, so once a page sets openGraph the
// root card (app/opengraph-image.tsx) drops off and the link shares with no
// picture. This points at it by URL instead. The twitter card follows the
// openGraph image on its own.
export function siteOpenGraph(title: string, description: string, path: string): Metadata["openGraph"] {
  return {
    ...pageOpenGraph(title, description, path),
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        type: "image/png",
        // Same alt as app/opengraph-image.tsx.
        alt: "Saylo: לומדים אנגלית ברמה שלכם",
      },
    ],
  };
}
