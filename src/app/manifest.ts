import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saylo — לומדים אנגלית בקצב שלכם",
    short_name: "Saylo",
    description: "לומדים אנגלית בקצב שלכם — מבחן רמה, מסלול אישי ומורה AI שמכיר את החולשות שלכם",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0b0c0f",
    theme_color: "#4d9eff",
    lang: "he",
    dir: "rtl",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
