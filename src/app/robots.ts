import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/admin/",
        "/consent/",
        "/dashboard",
        "/placement",
        "/learn",
        "/vocabulary",
        "/grammar",
        "/reading",
        "/listening",
        "/writing",
        "/speaking",
        "/idioms",
        "/games",
        "/review",
        "/profile",
        "/progress",
      ],
    },
    sitemap: "https://www.saylolearn.com/sitemap.xml",
  };
}
