import type { MetadataRoute } from "next";

// Locale-prefixed variants must be listed too — /ja/login is a different
// path than /login as far as crawlers are concerned (en has no prefix).
const PRIVATE_PATHS = ["/login", "/register", "/profile"];
const LOCALE_PREFIXES = ["", "/zh-TW", "/zh-CN", "/ja"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        ...LOCALE_PREFIXES.flatMap((prefix) =>
          PRIVATE_PATHS.map((path) => `${prefix}${path}`),
        ),
      ],
    },
    sitemap: "https://www.abovethespread.com/sitemap.xml",
  };
}
