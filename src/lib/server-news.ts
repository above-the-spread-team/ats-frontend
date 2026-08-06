const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function serverFetchNewsById(
  newsId: number,
  lang?: string
): Promise<{ data: unknown; error?: string }> {
  try {
    const url = lang
      ? `${BACKEND_URL}/api/v1/news/${newsId}?lang=${lang}`
      : `${BACKEND_URL}/api/v1/news/${newsId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return { data: null, error: `Failed to fetch news: ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to fetch news",
    };
  }
}

export async function serverFetchNewsList(
  page: number = 1,
  pageSize: number = 20,
  lang?: string,
  articleType?: string,
  tagIds?: number[]
): Promise<{ data: unknown; error?: string }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (lang) params.set("lang", lang);
    if (articleType) params.set("article_type", articleType);
    if (tagIds && tagIds.length > 0) {
      tagIds.forEach((id) => params.append("tag_ids", id.toString()));
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/news?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return { data: null, error: `Failed to fetch news: ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to fetch news",
    };
  }
}
