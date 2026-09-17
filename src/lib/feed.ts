/**
 * RSS 2.0. `rssXml` is a pure string builder; `newsFeedResponse` is the fetching half
 * shared by /feed.xml (en) and /{locale}/feed.xml.
 */
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { articlePath } from "@/lib/article-url";
import { feedUrl, localizedUrl } from "@/lib/seo";
import { serverFetchNewsList } from "@/lib/server-news";
import { escapeXml, parseTimestamp, xmlResponse } from "@/lib/sitemap-xml";
import type { NewsListResponse } from "@/type/fastapi/news";

export interface RssItem {
  title: string;
  link: string;
  /** Marked isPermaLink when it equals `link` */
  guid: string;
  pubDate: string | Date;
  description?: string | null;
  categories?: string[];
}

export interface RssChannel {
  title: string;
  description: string;
  /** Home page of the feed's locale */
  siteUrl: string;
  /** This feed's own URL (atom:link rel="self") */
  feedUrl: string;
  /** RSS language code, e.g. "en", "ja", "zh-tw" */
  language: string;
  items: RssItem[];
}

/** RFC-822 date ("Thu, 17 Sep 2026 10:00:00 GMT"); undefined when it does not parse. */
export function rfc822Date(value: string | Date): string | undefined {
  return parseTimestamp(value)?.toUTCString();
}

export function rssXml(channel: RssChannel): string {
  const items = channel.items.map((item) => {
    const pubDate = rfc822Date(item.pubDate);
    const lines = [
      `<title>${escapeXml(item.title)}</title>`,
      `<link>${escapeXml(item.link)}</link>`,
      `<guid isPermaLink="${item.guid === item.link}">${escapeXml(item.guid)}</guid>`,
    ];
    if (pubDate) lines.push(`<pubDate>${pubDate}</pubDate>`);
    if (item.description) {
      lines.push(`<description>${escapeXml(item.description)}</description>`);
    }
    for (const category of item.categories ?? []) {
      lines.push(`<category>${escapeXml(category)}</category>`);
    }
    return `<item>${lines.join("")}</item>`;
  });

  const newest = channel.items
    .map((item) => rfc822Date(item.pubDate))
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(channel.title)}</title>`,
    `<link>${escapeXml(channel.siteUrl)}</link>`,
    `<description>${escapeXml(channel.description)}</description>`,
    `<language>${escapeXml(channel.language)}</language>`,
    `<atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...(newest ? [`<lastBuildDate>${newest}</lastBuildDate>`] : []),
    ...items,
    "</channel>",
    "</rss>",
    "",
  ].join("\n");
}

const FEED_ITEMS = 30;
const FEED_CACHE_SECONDS = 900;
const FEED_FAILURE_CACHE_SECONDS = 60;

/** Latest published articles of `locale` (must be one of routing.locales) as RSS. */
export async function newsFeedResponse(locale: string): Promise<Response> {
  const isDefaultLocale = locale === routing.defaultLocale;
  const [t, { data }] = await Promise.all([
    getTranslations({ locale, namespace: "metadata" }),
    serverFetchNewsList(1, FEED_ITEMS, isDefaultLocale ? undefined : locale),
  ]);
  const list = data as NewsListResponse | null;

  const items: RssItem[] = (list?.items ?? [])
    // ?lang= falls back to English for untranslated articles — those belong to /feed.xml only.
    .filter(
      (article) =>
        article.is_published &&
        (isDefaultLocale || !article.language || article.language === locale),
    )
    .map((article) => {
      const link = localizedUrl(locale, articlePath(article));
      return {
        title: article.title,
        link,
        guid: link,
        pubDate: article.created_at,
        description: article.content_preview,
        categories: article.tags?.map((tag) => tag.name),
      };
    });

  const body = rssXml({
    title: t("feedTitle"),
    description: t("feedDescription"),
    siteUrl: localizedUrl(locale, "/"),
    feedUrl: feedUrl(locale),
    language: locale.toLowerCase(),
    items,
  });

  // A backend outage yields a valid but empty feed — keep that out of the CDN for long.
  return xmlResponse(
    body,
    list ? FEED_CACHE_SECONDS : FEED_FAILURE_CACHE_SECONDS,
    "application/rss+xml; charset=utf-8",
  );
}
