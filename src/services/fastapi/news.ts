import { useQuery } from "@tanstack/react-query";
import type {
  NewsListResponse,
  NewsResponse,
  NewsError,
} from "@/type/fastapi/news";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Fetch news list with pagination and optional tag filtering
 */
export async function fetchNews(
  page: number = 1,
  pageSize: number = 20,
  tagIds?: number[]
): Promise<NewsListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  // Add tag_ids if provided
  if (tagIds && tagIds.length > 0) {
    tagIds.forEach((id) => params.append("tag_ids", id.toString()));
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      typeof errorData.detail === "string"
        ? errorData.detail
        : "Failed to fetch news"
    );
  }

  return response.json();
}

/**
 * Fetch a single news article by ID
 */
export async function fetchNewsById(newsId: number): Promise<NewsResponse> {
  const response = await fetch(`${BACKEND_URL}/api/v1/news/${newsId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      typeof errorData.detail === "string"
        ? errorData.detail
        : "Failed to fetch news"
    );
  }

  return response.json();
}

/**
 * React Query hook for fetching news list
 */
export function useNews(
  page: number = 1,
  pageSize: number = 20,
  tagIds?: number[]
) {
  return useQuery<NewsListResponse, NewsError>({
    queryKey: ["news", page, pageSize, tagIds],
    queryFn: () => fetchNews(page, pageSize, tagIds),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for fetching a single news article by ID
 */
export function useNewsById(newsId: number) {
  return useQuery<NewsResponse, NewsError>({
    queryKey: ["news", newsId],
    queryFn: () => fetchNewsById(newsId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!newsId && newsId > 0, // Only fetch if newsId is valid
  });
}
