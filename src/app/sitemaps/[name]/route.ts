import { routing } from "@/i18n/routing";
import { articlePath } from "@/lib/article-url";
import { gamePath } from "@/lib/game-url";
import { hubPath } from "@/lib/hub-url";
import { languageAlternates, localizedUrl } from "@/lib/seo";
import { serverFetchFixturesSitemap } from "@/lib/server-fixture";
import { serverFetchNewsSitemap } from "@/lib/server-news";
import { serverFetchTagHubs } from "@/lib/server-tags";
import {
  SITEMAP_ARTICLES_PER_FILE,
  urlsetXml,
  xmlResponse,
  type SitemapChangeFreq,
  type SitemapUrlEntry,
} from "@/lib/sitemap-xml";

// Child sitemaps of /sitemap.xml. No generateStaticParams on purpose: the route stays
// dynamic, so caching is the CDN's (Cache-Control below) plus the Data Cache of the
// backend fetches — which lets a backend failure be cached for a minute, not an hour.
export const revalidate = 3600;

const CACHE_SECONDS = 3600;
const FAILURE_CACHE_SECONDS = 60;

// /articles is left out: it is a duplicate view canonicalised to /news and /our-picks.
const STATIC_PAGES: {
  path: string;
  priority: number;
  changefreq: SitemapChangeFreq;
}[] = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/games", priority: 0.9, changefreq: "hourly" },
  { path: "/news", priority: 0.9, changefreq: "hourly" },
  { path: "/our-picks", priority: 0.8, changefreq: "daily" },
  { path: "/discuss", priority: 0.7, changefreq: "daily" },
  { path: "/stats", priority: 0.7, changefreq: "weekly" },
  { path: "/teams", priority: 0.7, changefreq: "daily" },
  { path: "/leagues", priority: 0.7, changefreq: "daily" },
  { path: "/world-cup", priority: 0.6, changefreq: "weekly" },
  { path: "/world-cup/news", priority: 0.6, changefreq: "daily" },
];

type EntryOptions = Omit<SitemapUrlEntry, "loc" | "alternates">;

/** One <url> per locale, each carrying the full hreflang set for `locales`. */
function localizedEntries(
  path: string,
  options: EntryOptions = {},
  locales: readonly string[] = routing.locales,
): SitemapUrlEntry[] {
  const alternates = languageAlternates(path, locales);
  return locales.map((locale) => ({
    loc: localizedUrl(locale, path),
    ...options,
    alternates,
  }));
}

function staticEntries(): SitemapUrlEntry[] {
  return STATIC_PAGES.flatMap(({ path, priority, changefreq }) =>
    localizedEntries(path, { priority, changefreq }),
  );
}

async function hubEntries(): Promise<SitemapUrlEntry[]> {
  const hubs = await serverFetchTagHubs();
  return hubs.flatMap((hub) => {
    const path = hubPath(hub);
    if (!path) return [];
    return localizedEntries(path, {
      lastmod: hub.last_news_at,
      changefreq: "daily",
      priority: hub.type === "league" ? 0.7 : 0.6,
    });
  });
}

async function gameEntries(): Promise<SitemapUrlEntry[]> {
  const fixtures = await serverFetchFixturesSitemap();
  return fixtures.flatMap((fixture) =>
    localizedEntries(
      gamePath({
        id: fixture.fixture_id,
        home: fixture.home_team,
        away: fixture.away_team,
      }),
      { lastmod: fixture.updated_at, changefreq: "hourly", priority: 0.6 },
    ),
  );
}

/** null = backend unreachable (as opposed to a page past the end, which is just empty). */
async function articleEntries(page: number): Promise<SitemapUrlEntry[] | null> {
  const news = await serverFetchNewsSitemap(page, SITEMAP_ARTICLES_PER_FILE);
  if (!news) return null;

  return news.items.flatMap((article) => {
    // Only the locales the article was actually translated into get a URL / hreflang.
    const available = routing.locales.filter((locale) =>
      article.available_languages?.includes(locale),
    );
    return localizedEntries(
      articlePath(article),
      { lastmod: article.updated_at || article.created_at },
      available.length > 0 ? available : [routing.defaultLocale],
    );
  });
}

function notFound(): Response {
  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  let entries: SitemapUrlEntry[] | null;
  if (name === "static.xml") {
    return xmlResponse(urlsetXml(staticEntries()), CACHE_SECONDS);
  } else if (name === "hubs.xml") {
    entries = await hubEntries();
  } else if (name === "games.xml") {
    entries = await gameEntries();
  } else {
    const match = /^articles-([1-9]\d{0,5})\.xml$/.exec(name);
    if (!match) return notFound();
    entries = await articleEntries(Number.parseInt(match[1], 10));
  }

  // The hub / fixture helpers swallow errors into [], so "empty" is treated as "maybe
  // down": still a valid urlset, but cached briefly so a blip is not pinned for an hour.
  const failed = entries === null || (entries.length === 0 && !name.startsWith("articles-"));
  return xmlResponse(
    urlsetXml(entries ?? []),
    failed ? FAILURE_CACHE_SECONDS : CACHE_SECONDS,
  );
}
