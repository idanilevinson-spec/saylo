// BreadcrumbList JSON-LD, so search results show the page's place in the
// site ("Saylo › בגרות › שאלון E") instead of a bare URL.
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `https://www.saylolearn.com${t.path}`,
    })),
  };
}

// JSON for a <script type="application/ld+json">, with "<" escaped so no
// string in the data can close the script tag (as the Next.js guide does).
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
