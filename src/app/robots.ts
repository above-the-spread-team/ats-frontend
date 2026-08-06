import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/register", "/profile"],
    },
    sitemap: "https://www.abovethespread.com/sitemap.xml",
  };
}
