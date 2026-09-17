import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Locale-prefixed variants must be listed too — /ja/login is a different
// path than /login as far as crawlers are concerned (en has no prefix).
const PRIVATE_PATHS = ["/login", "/register", "/profile"];
const LOCALE_PREFIXES = ["", "/zh-TW", "/zh-CN", "/ja"];

const DISALLOW = [
  "/api/",
  ...LOCALE_PREFIXES.flatMap((prefix) =>
    PRIVATE_PATHS.map((path) => `${prefix}${path}`),
  ),
];

// AI search / assistant crawlers are welcome: being cited in AI answers is a goal.
// A crawler that matches a named group ignores the "*" group entirely, so the
// disallow list is repeated here rather than inherited.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
  };
}
