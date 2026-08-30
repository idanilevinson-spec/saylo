import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saylo — לומדים אנגלית בקצב שלכם",
    short_name: "Saylo",
    description: "לומדים אנגלית בקצב שלכם — מבחן רמה, מסלול אישי ומורה AI שמכיר את החולשות שלכם",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f9fd",
    theme_color: "#0066d6",
    lang: "he",
    dir: "rtl",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
