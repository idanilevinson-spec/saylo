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
