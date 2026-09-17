/**
 * Pure XML string builders for the sitemap index, urlsets and the Google News sitemap.
 * No fetching here — the route handlers under src/app/sitemap.xml, src/app/sitemaps and
 * src/app/news-sitemap.xml feed these with data.
 */

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

/**
 * Articles per /sitemaps/articles-{n}.xml. Each article expands to up to 4 locale URLs with
 * 5 alternates each (~3.8 KB), so 500 keeps a file around 1.9 MB — under Vercel's 4.5 MB
 * function response limit. The index (sitemap.xml) and the article files must agree on it.
 */
export const SITEMAP_ARTICLES_PER_FILE = 500;

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

/** Escape text / attribute values; drops what XML 1.0 forbids (control chars, lone surrogates). */
export function escapeXml(value: string): string {
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")
    .replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);
}

/**
 * Backend timestamp → Date; undefined when it does not parse. A timestamp without an
 * offset is read as UTC, never as server-local time.
 */
export function parseTimestamp(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  const hasOffset = typeof value !== "string" || /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const date = new Date(hasOffset ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** W3C datetime (UTC, second precision), the format sitemaps want. */
export function w3cDate(value: string | Date | null | undefined): string | undefined {
  return parseTimestamp(value)?.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export type SitemapChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string | Date | null;
  changefreq?: SitemapChangeFreq;
  priority?: number;
  /** hreflang → absolute URL (include the entry's own locale and x-default) */
  alternates?: Record<string, string>;
}

export interface SitemapIndexItem {
  loc: string;
  lastmod?: string | Date | null;
}

export interface NewsSitemapEntry {
  loc: string;
  publicationName: string;
  /** Google News language code: ISO 639, except zh-cn / zh-tw */
  language: string;
  publicationDate: string | Date;
  title: string;
}

export function urlsetXml(entries: SitemapUrlEntry[]): string {
  const urls = entries.map((entry) => {
    const lines = [`<loc>${escapeXml(entry.loc)}</loc>`];
    const lastmod = w3cDate(entry.lastmod);
    if (lastmod) lines.push(`<lastmod>${lastmod}</lastmod>`);
    if (entry.changefreq) lines.push(`<changefreq>${entry.changefreq}</changefreq>`);
    if (entry.priority !== undefined) {
      lines.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
    }
    for (const [hreflang, href] of Object.entries(entry.alternates ?? {})) {
      lines.push(
        `<xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`,
      );
    }
    return `<url>${lines.join("")}</url>`;
  });

  return [
    XML_HEADER,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

export function sitemapIndexXml(items: SitemapIndexItem[]): string {
  const sitemaps = items.map((item) => {
    const lastmod = w3cDate(item.lastmod);
    return `<sitemap><loc>${escapeXml(item.loc)}</loc>${
      lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
    }</sitemap>`;
  });

  return [
    XML_HEADER,
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps,
    "</sitemapindex>",
    "",
  ].join("\n");
}

/** Google News sitemap — entries without a parseable publication date are dropped. */
export function newsUrlsetXml(entries: NewsSitemapEntry[]): string {
  const urls: string[] = [];
  for (const entry of entries) {
    const publicationDate = w3cDate(entry.publicationDate);
    if (!publicationDate) continue;
    urls.push(
      "<url>" +
        `<loc>${escapeXml(entry.loc)}</loc>` +
        "<news:news>" +
        "<news:publication>" +
        `<news:name>${escapeXml(entry.publicationName)}</news:name>` +
        `<news:language>${escapeXml(entry.language)}</news:language>` +
        "</news:publication>" +
        `<news:publication_date>${publicationDate}</news:publication_date>` +
        `<news:title>${escapeXml(entry.title)}</news:title>` +
        "</news:news>" +
        "</url>",
    );
  }

  return [
    XML_HEADER,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

/** CDN-cacheable response shared by the XML routes (sitemaps, feeds). */
export function xmlResponse(
  body: string,
  maxAgeSeconds: number,
  contentType: string = "application/xml; charset=utf-8",
): Response {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds}`,
    },
  });
}
