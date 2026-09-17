import { connection } from "next/server";
import { routing } from "@/i18n/routing";
import { articlePath } from "@/lib/article-url";
import { SITE_NAME, localizedUrl } from "@/lib/seo";
import { serverFetchNewsSitemap } from "@/lib/server-news";
import {
  newsUrlsetXml,
  w3cDate,
  xmlResponse,
  type NewsSitemapEntry,
} from "@/lib/sitemap-xml";

// Rendered per request (connection()) rather than prerendered + ISR: a build or revalidation
// that happens while the backend is down would otherwise pin the degraded output for a full
// period. Caching is the CDN's (Cache-Control) plus the Data Cache of the fetches.
const CACHE_SECONDS = 600;
const FAILURE_CACHE_SECONDS = 60;

const HOUR_MS = 60 * 60 * 1000;
const WINDOW_MS = 48 * HOUR_MS; // Google News only reads the last two days
const MAX_URLS = 1000; // Google News sitemap limit

// Google News wants ISO 639 codes, with zh-cn / zh-tw as the two documented exceptions.
const NEWS_LANGUAGE: Record<string, string> = {
  en: "en",
  ja: "ja",
  "zh-TW": "zh-tw",
  "zh-CN": "zh-cn",
};

export async function GET() {
  await connection();
  const cutoff = Date.now() - WINDOW_MS;
  // Floored to the hour: the fetch URL is the Data Cache key, so a per-request timestamp
  // would never hit. The exact 48 h cut is applied below.
  const since = new Date(Math.floor(cutoff / HOUR_MS) * HOUR_MS);

  const news = await serverFetchNewsSitemap(1, 1000, {
    since,
    includeTitles: true,
    revalidate: CACHE_SECONDS,
  });

  const entries: NewsSitemapEntry[] = [];
  // The backend orders by id ascending — walk newest first so the cap drops the oldest.
  for (const article of [...(news?.items ?? [])].reverse()) {
    const publicationDate = w3cDate(article.created_at);
    if (!publicationDate || Date.parse(publicationDate) < cutoff) continue;

    const path = articlePath(article);
    for (const locale of routing.locales) {
      if (!article.available_languages?.includes(locale)) continue;
      const title = article.titles?.[locale] || article.titles?.[routing.defaultLocale];
      if (!title) continue;
      entries.push({
        loc: localizedUrl(locale, path),
        publicationName: SITE_NAME,
        language: NEWS_LANGUAGE[locale] ?? locale.toLowerCase(),
        publicationDate,
        title,
      });
    }
  }

  return xmlResponse(
    newsUrlsetXml(entries.slice(0, MAX_URLS)),
    news ? CACHE_SECONDS : FAILURE_CACHE_SECONDS,
  );
}
