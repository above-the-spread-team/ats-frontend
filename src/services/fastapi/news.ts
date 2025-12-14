import { useQuery } from "@tanstack/react-query";
import type { NewsListResponse, NewsError } from "@/type/fastapi/news";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Fetch news list with pagination
 */
export async function fetchNews(
  page: number = 1,
  pageSize: number = 20
): Promise<NewsListResponse> {
  const response = await fetch(
    `${BACKEND_URL}/api/v1/news?page=${page}&page_size=${pageSize}`,
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
 * React Query hook for fetching news list
 */
export function useNews(page: number = 1, pageSize: number = 20) {
  return useQuery<NewsListResponse, NewsError>({
    queryKey: ["news", page, pageSize],
    queryFn: () => fetchNews(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
