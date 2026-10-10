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
