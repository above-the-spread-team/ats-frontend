import { connection } from "next/server";
import { SITE_URL } from "@/lib/seo";
import { serverFetchNewsSitemap } from "@/lib/server-news";
import {
  SITEMAP_ARTICLES_PER_FILE,
  sitemapIndexXml,
  xmlResponse,
} from "@/lib/sitemap-xml";

// Rendered per request (connection()) rather than prerendered + ISR: a build or revalidation
// that happens while the backend is down would otherwise pin the degraded output for a full
// period. Caching is the CDN's (Cache-Control) plus the Data Cache of the fetches.
const CACHE_SECONDS = 3600;
const FAILURE_CACHE_SECONDS = 60;

// Sitemap index. Hand-rolled instead of Next's generateSitemaps(), which drops /sitemap.xml
// (the URL registered in Search Console) and emits no index.
export async function GET() {
  await connection();
  // total only — if the backend is unreachable the index still lists articles-1.
  const news = await serverFetchNewsSitemap(1, 1);
  const articleFiles = Math.max(
    1,
    Math.ceil((news?.total ?? 0) / SITEMAP_ARTICLES_PER_FILE),
  );

  const names = [
    "static",
    "hubs",
    "games",
    ...Array.from({ length: articleFiles }, (_, index) => `articles-${index + 1}`),
  ];

  return xmlResponse(
    sitemapIndexXml(names.map((name) => ({ loc: `${SITE_URL}/sitemaps/${name}.xml` }))),
    news ? CACHE_SECONDS : FAILURE_CACHE_SECONDS,
  );
}
