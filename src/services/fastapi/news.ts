import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  NewsListResponse,
  NewsResponse,
  NewsError,
} from "@/type/fastapi/news";
import type {
  CommentCreate,
  CommentUpdate,
  CommentResponse,
  CommentListResponse,
} from "@/type/fastapi/comments";
import { getAuthHeader } from "./token-storage";

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
 * React Query hook for infinite scrolling news list
 * Fetches 15 items per page, loads more on scroll
 */
export function useInfiniteNews(tagIds?: number[]) {
  return useInfiniteQuery<NewsListResponse, NewsError>({
    queryKey: ["news", "infinite", tagIds],
    queryFn: ({ pageParam = 1 }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      return fetchNews(page, 15, tagIds);
    },
    getNextPageParam: (lastPage) => {
      // If current page is less than total pages, return next page number
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      // Otherwise, no more pages
      return undefined;
    },
    initialPageParam: 1,
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

// ============================================================================
// News Comments API
// ============================================================================

/**
 * Create a new comment on a news article
 * Requires authentication
 */
export async function createNewsComment(
  newsId: number,
  data: CommentCreate
): Promise<CommentResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/${newsId}/comments`,
    {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 422) {
      const validationErrors = errorData.detail || [];
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const field = firstError.loc?.[firstError.loc.length - 1] || "field";
        const message = firstError.msg || "Validation error";
        throw new Error(`${field}: ${message}`);
      }
      throw new Error(
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Invalid comment data"
      );
    }

    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to create comment" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "User account is inactive");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "News article not found");
    }

    throw new Error(
      error.detail || "Failed to create comment. Please try again."
    );
  }

  const comment: CommentResponse = await response.json();
  return comment;
}

/**
 * Get comments for a news article
 * Optionally filter by page and include replies
 */
export async function listNewsComments(
  newsId: number,
  page: number = 1,
  pageSize: number = 20,
  includeReplies: boolean = false
): Promise<CommentListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    include_replies: includeReplies.toString(),
  });

  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/${newsId}/comments?${params.toString()}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch comments" };

    if (response.status === 404) {
      throw new Error(error.detail || "News article not found");
    }

    throw new Error(
      error.detail || "Failed to fetch comments. Please try again."
    );
  }

  const result: CommentListResponse = await response.json();
  return result;
}

/**
 * Get a single news comment by ID
 */
export async function getNewsComment(
  commentId: number
): Promise<CommentResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/comments/${commentId}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch comment" };

    if (response.status === 404) {
      throw new Error(error.detail || "Comment not found");
    }

    throw new Error(
      error.detail || "Failed to fetch comment. Please try again."
    );
  }

  const comment: CommentResponse = await response.json();
  return comment;
}

/**
 * Get replies for a specific top-level news comment (lazy loading)
 */
export async function getNewsCommentReplies(
  commentId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<CommentListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/comments/${commentId}/replies?${params.toString()}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch replies" };

    if (response.status === 404) {
      throw new Error(error.detail || "Comment not found");
    }

    throw new Error(
      error.detail || "Failed to fetch replies. Please try again."
    );
  }

  const result: CommentListResponse = await response.json();
  return result;
}

/**
 * Update a news comment
 * Requires authentication - only the comment author can update
 */
export async function updateNewsComment(
  commentId: number,
  data: CommentUpdate
): Promise<CommentResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/comments/${commentId}`,
    {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 422) {
      const validationErrors = errorData.detail || [];
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const field = firstError.loc?.[firstError.loc.length - 1] || "field";
        const message = firstError.msg || "Validation error";
        throw new Error(`${field}: ${message}`);
      }
      throw new Error(
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Invalid comment data"
      );
    }

    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to update comment" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to update this comment"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Comment not found");
    }

    throw new Error(
      error.detail || "Failed to update comment. Please try again."
    );
  }

  const comment: CommentResponse = await response.json();
  return comment;
}

/**
 * Delete a news comment
 * Requires authentication - only the comment author can delete
 */
export async function deleteNewsComment(commentId: number): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/comments/${commentId}`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to delete comment" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to delete this comment"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Comment not found");
    }

    throw new Error(
      error.detail || "Failed to delete comment. Please try again."
    );
  }
}

// ============================================================================
// News Reactions API
// ============================================================================

/**
 * Like a news article
 * If already liked, removes the like
 * If disliked, changes to like
 * Requires authentication
 */
export async function likeNews(newsId: number): Promise<NewsResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/news/${newsId}/like`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to like news" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "News article not found");
    }

    throw new Error(error.detail || "Failed to like news. Please try again.");
  }

  const news: NewsResponse = await response.json();
  return news;
}

/**
 * Dislike a news article
 * If already disliked, removes the dislike
 * If liked, changes to dislike
 * Requires authentication
 */
export async function dislikeNews(newsId: number): Promise<NewsResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/news/${newsId}/dislike`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to dislike news" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "News article not found");
    }

    throw new Error(
      error.detail || "Failed to dislike news. Please try again."
    );
  }

  const news: NewsResponse = await response.json();
  return news;
}

/**
 * Remove reaction from a news article
 * Requires authentication
 */
export async function removeNewsReaction(
  newsId: number
): Promise<NewsResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/${newsId}/reaction`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to remove reaction" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "News article not found");
    }

    throw new Error(
      error.detail || "Failed to remove reaction. Please try again."
    );
  }

  const news: NewsResponse = await response.json();
  return news;
}

/**
 * Like a news comment
 * If already liked, removes the like
 * If disliked, changes to like
 * Requires authentication
 */
export async function likeNewsComment(
  commentId: number
): Promise<CommentResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/comments/${commentId}/like`,
    {
      method: "POST",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to like comment" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Comment not found");
    }

    throw new Error(
      error.detail || "Failed to like comment. Please try again."
    );
  }

  const comment: CommentResponse = await response.json();
  return comment;
}

/**
 * Dislike a news comment
 * If already disliked, removes the dislike
 * If liked, changes to dislike
 * Requires authentication
 */
export async function dislikeNewsComment(
  commentId: number
): Promise<CommentResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/comments/${commentId}/dislike`,
    {
      method: "POST",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to dislike comment" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Comment not found");
    }

    throw new Error(
      error.detail || "Failed to dislike comment. Please try again."
    );
  }

  const comment: CommentResponse = await response.json();
  return comment;
}

/**
 * Remove reaction from a news comment
 * Requires authentication
 */
export async function removeNewsCommentReaction(
  commentId: number
): Promise<CommentResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/news/comments/${commentId}/reaction`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: NewsError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to remove reaction" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Comment not found");
    }

    throw new Error(
      error.detail || "Failed to remove reaction. Please try again."
    );
  }

  const comment: CommentResponse = await response.json();
  return comment;
}

// ============================================================================
// React Query Hooks for News Comments
// ============================================================================

/**
 * React Query hook to get comments for a news article
 * By default, only returns top-level comments (includeReplies = false)
 * Replies are loaded separately using useNewsCommentReplies hook
 */
export function useNewsComments(
  newsId: number | null,
  page: number = 1,
  pageSize: number = 20,
  includeReplies: boolean = false
) {
  return useQuery<CommentListResponse>({
    queryKey: ["newsComments", newsId, page, pageSize, includeReplies],
    queryFn: () => listNewsComments(newsId!, page, pageSize, includeReplies),
    enabled: !!newsId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to get replies for a specific top-level news comment (lazy loading)
 * Use this when user clicks "View replies" on a comment
 */
export function useNewsCommentReplies(
  commentId: number | null,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<CommentListResponse>({
    queryKey: ["newsCommentReplies", commentId, page, pageSize],
    queryFn: () => getNewsCommentReplies(commentId!, page, pageSize),
    enabled: !!commentId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to get a single news comment by ID
 */
export function useNewsComment(commentId: number | null) {
  return useQuery<CommentResponse>({
    queryKey: ["newsComment", commentId],
    queryFn: () => getNewsComment(commentId!),
    enabled: !!commentId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query mutation hook for creating a news comment
 * Invalidates comments queries on success
 */
export function useCreateNewsComment() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponse,
    Error,
    { newsId: number; data: CommentCreate }
  >({
    mutationFn: ({ newsId, data }) => createNewsComment(newsId, data),
    onSuccess: (_, variables) => {
      // Invalidate comments for the news article
      queryClient.invalidateQueries({
        queryKey: ["newsComments", variables.newsId],
      });
      // Also invalidate news to update comment count
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({
        queryKey: ["news", variables.newsId],
      });
    },
  });
}

/**
 * React Query mutation hook for updating a news comment
 * Invalidates the specific comment and comments list queries on success
 */
export function useUpdateNewsComment() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponse,
    Error,
    { commentId: number; data: CommentUpdate }
  >({
    mutationFn: ({ commentId, data }) => updateNewsComment(commentId, data),
    onSuccess: (data, variables) => {
      // Invalidate the specific comment
      queryClient.invalidateQueries({
        queryKey: ["newsComment", variables.commentId],
      });
      // Invalidate comments for the news article
      if (data.news_id) {
        queryClient.invalidateQueries({
          queryKey: ["newsComments", data.news_id],
        });
      }
      // Invalidate comment replies (in case the updated comment is a reply)
      queryClient.invalidateQueries({
        queryKey: ["newsCommentReplies"],
      });
    },
  });
}

/**
 * React Query mutation hook for deleting a news comment
 * Invalidates comments list queries on success
 */
export function useDeleteNewsComment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { commentId: number; newsId: number }>({
    mutationFn: ({ commentId }) => deleteNewsComment(commentId),
    onSuccess: (_, variables) => {
      // Remove the specific comment from cache
      queryClient.removeQueries({
        queryKey: ["newsComment", variables.commentId],
      });
      // Invalidate comments for the news article
      queryClient.invalidateQueries({
        queryKey: ["newsComments", variables.newsId],
      });
      // Invalidate comment replies (in case the deleted comment is a reply)
      queryClient.invalidateQueries({
        queryKey: ["newsCommentReplies"],
      });
      // Also invalidate news to update comment count
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({
        queryKey: ["news", variables.newsId],
      });
    },
  });
}

// ============================================================================
// React Query Hooks for News Reactions
// ============================================================================

/**
 * React Query mutation hook for liking a news article
 * Updates news queries on success with optimistic cache updates
 */
export function useLikeNews() {
  const queryClient = useQueryClient();

  return useMutation<NewsResponse, Error, number>({
    mutationFn: likeNews,
    onSuccess: (data, newsId) => {
      // Update the specific news in cache
      queryClient.setQueryData<NewsResponse>(["news", newsId], data);

      // Update news in news list cache
      queryClient.setQueriesData<NewsListResponse>(
        { queryKey: ["news"] },
        (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === newsId ? data : item
            ),
          };
        }
      );

      // Invalidate after a short delay to ensure backend is updated
      // This is especially important for Safari which handles cookies/storage differently
      // Posts work because infinite queries refetch more frequently, but news uses staleTime
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["news", newsId],
        });
        queryClient.invalidateQueries({
          queryKey: ["news"],
        });
      }, 100);
    },
  });
}

/**
 * React Query mutation hook for disliking a news article
 * Updates news queries on success with optimistic cache updates
 */
export function useDislikeNews() {
  const queryClient = useQueryClient();

  return useMutation<NewsResponse, Error, number>({
    mutationFn: dislikeNews,
    onSuccess: (data, newsId) => {
      // Update the specific news in cache
      queryClient.setQueryData<NewsResponse>(["news", newsId], data);

      // Update news in news list cache
      queryClient.setQueriesData<NewsListResponse>(
        { queryKey: ["news"] },
        (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === newsId ? data : item
            ),
          };
        }
      );

      // Invalidate after a short delay to ensure backend is updated
      // This is especially important for Safari which handles cookies/storage differently
      // Posts work because infinite queries refetch more frequently, but news uses staleTime
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["news", newsId],
        });
        queryClient.invalidateQueries({
          queryKey: ["news"],
        });
      }, 100);
    },
  });
}

/**
 * React Query mutation hook for removing reaction from a news article
 * Updates news queries on success
 */
export function useRemoveNewsReaction() {
  const queryClient = useQueryClient();

  return useMutation<NewsResponse, Error, number>({
    mutationFn: removeNewsReaction,
    onSuccess: (_, newsId) => {
      // Invalidate news to refetch with updated reaction counts
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["news", newsId] });
    },
  });
}

/**
 * React Query mutation hook for liking a news comment
 * Updates comments queries on success with optimistic cache updates
 */
export function useLikeNewsComment() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, number>({
    mutationFn: likeNewsComment,
    onSuccess: (data, commentId) => {
      // Update the specific comment in cache
      queryClient.setQueryData<CommentResponse>(
        ["newsComment", commentId],
        data
      );

      // Update comment in comments list cache
      if (data.news_id) {
        queryClient.setQueriesData<CommentListResponse>(
          { queryKey: ["newsComments", data.news_id] },
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              items: oldData.items.map((item) =>
                item.id === commentId ? data : item
              ),
            };
          }
        );
      }

      // Update comment in replies cache
      queryClient.setQueriesData<CommentListResponse>(
        { queryKey: ["newsCommentReplies"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === commentId ? data : item
            ),
          };
        }
      );

      // Invalidate after a short delay to ensure backend is updated
      setTimeout(() => {
        if (data.news_id) {
          queryClient.invalidateQueries({
            queryKey: ["newsComments", data.news_id],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["newsComment", commentId],
        });
      }, 100);
    },
  });
}

/**
 * React Query mutation hook for disliking a news comment
 * Updates comments queries on success with optimistic cache updates
 */
export function useDislikeNewsComment() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, number>({
    mutationFn: dislikeNewsComment,
    onSuccess: (data, commentId) => {
      // Update the specific comment in cache
      queryClient.setQueryData<CommentResponse>(
        ["newsComment", commentId],
        data
      );

      // Update comment in comments list cache
      if (data.news_id) {
        queryClient.setQueriesData<CommentListResponse>(
          { queryKey: ["newsComments", data.news_id] },
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              items: oldData.items.map((item) =>
                item.id === commentId ? data : item
              ),
            };
          }
        );
      }

      // Update comment in replies cache
      queryClient.setQueriesData<CommentListResponse>(
        { queryKey: ["newsCommentReplies"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === commentId ? data : item
            ),
          };
        }
      );

      // Invalidate after a short delay to ensure backend is updated
      setTimeout(() => {
        if (data.news_id) {
          queryClient.invalidateQueries({
            queryKey: ["newsComments", data.news_id],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["newsComment", commentId],
        });
      }, 100);
    },
  });
}

/**
 * React Query mutation hook for removing reaction from a news comment
 * Updates comments queries on success
 */
export function useRemoveNewsCommentReaction() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, number>({
    mutationFn: removeNewsCommentReaction,
    onSuccess: (data, commentId) => {
      // Invalidate comments for the news article to refetch with updated reaction counts
      if (data.news_id) {
        queryClient.invalidateQueries({
          queryKey: ["newsComments", data.news_id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["newsComment", commentId],
      });
    },
  });
}
