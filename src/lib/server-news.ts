import type { NewsSitemapResponse } from "@/type/fastapi/news";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/** `status` lets pages tell a missing article (404) from a backend outage (5xx / 0). */
interface ServerFetchResult {
  data: unknown;
  error?: string;
  status: number;
}

async function serverGet(url: string, revalidate: number): Promise<ServerFetchResult> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate },
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Failed to fetch news: ${response.status}`,
        status: response.status,
      };
    }

    return { data: await response.json(), status: response.status };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to fetch news",
      status: 0,
    };
  }
}

export async function serverFetchNewsById(
  newsId: number,
  lang?: string
): Promise<ServerFetchResult> {
  const url = lang
    ? `${BACKEND_URL}/api/v1/news/${newsId}?lang=${lang}`
    : `${BACKEND_URL}/api/v1/news/${newsId}`;
  return serverGet(url, 60);
}

interface NewsListOptions {
  fixtureId?: number;
  excludeArticleType?: string;
}

/** Published articles only — drafts must never reach server-rendered HTML, sitemaps or feeds. */
export async function serverFetchNewsList(
  page: number = 1,
  pageSize: number = 20,
  lang?: string,
  articleType?: string,
  tagIds?: number[],
  options: NewsListOptions = {}
): Promise<ServerFetchResult> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    is_published: "true",
  });

  if (lang) params.set("lang", lang);
  if (articleType) params.set("article_type", articleType);
  if (tagIds && tagIds.length > 0) {
    tagIds.forEach((id) => params.append("tag_ids", id.toString()));
  }
  if (options.fixtureId) params.set("fixture_id", options.fixtureId.toString());
  if (options.excludeArticleType) {
    params.set("exclude_article_type", options.excludeArticleType);
  }

  return serverGet(`${BACKEND_URL}/api/v1/news?${params.toString()}`, 60);
}

/** Lightweight id-ascending listing (no content) for sitemaps and feeds. */
export async function serverFetchNewsSitemap(
  page: number = 1,
  pageSize: number = 500,
  options: { since?: Date; includeTitles?: boolean; revalidate?: number } = {}
): Promise<NewsSitemapResponse | null> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (options.since) params.set("since", options.since.toISOString());
  if (options.includeTitles) params.set("include_titles", "true");

  const { data } = await serverGet(
    `${BACKEND_URL}/api/v1/news/sitemap?${params.toString()}`,
    options.revalidate ?? 3600
  );
  return (data as NewsSitemapResponse | null) ?? null;
}
