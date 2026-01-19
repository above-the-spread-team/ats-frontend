import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  PostCreate,
  PostUpdate,
  PostResponse,
  PostListResponse,
  PostError,
  ReactionStats,
} from "@/type/fastapi/posts";
import { getAuthHeader } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Create a new post
 * Requires authentication
 */
export async function createPost(data: PostCreate): Promise<PostResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/posts`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Handle validation errors (422)
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
          : "Invalid post data"
      );
    }

    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to create post" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "User account is inactive");
    }

    throw new Error(error.detail || "Failed to create post. Please try again.");
  }

  const post: PostResponse = await response.json();
  return post;
}

/**
 * Get a paginated list of posts
 * Optionally filter by author_id and tag_ids
 */
export async function listPosts(
  page: number = 1,
  pageSize: number = 20,
  authorId?: number,
  tagIds?: number[]
): Promise<PostListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (authorId !== undefined) {
    params.append("author_id", authorId.toString());
  }
  if (tagIds && tagIds.length > 0) {
    tagIds.forEach((tagId) => {
      params.append("tag_ids", tagId.toString());
    });
  }

  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts?${params.toString()}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch posts" };

    throw new Error(error.detail || "Failed to fetch posts. Please try again.");
  }

  const result: PostListResponse = await response.json();
  return result;
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: number): Promise<PostResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/posts/${postId}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch post" };

    if (response.status === 404) {
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(error.detail || "Failed to fetch post. Please try again.");
  }

  const post: PostResponse = await response.json();
  return post;
}

/**
 * Update a post
 * Requires authentication - only the post author can update
 */
export async function updatePost(
  postId: number,
  data: PostUpdate
): Promise<PostResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/posts/${postId}`, {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Handle validation errors (422)
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
          : "Invalid post data"
      );
    }

    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to update post" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to update this post"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(error.detail || "Failed to update post. Please try again.");
  }

  const post: PostResponse = await response.json();
  return post;
}

/**
 * Delete a post
 * Requires authentication - only the post author can delete
 */
export async function deletePost(postId: number): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/posts/${postId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to delete post" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to delete this post"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(error.detail || "Failed to delete post. Please try again.");
  }
}

/**
 * Get all posts by a specific user
 */
export async function getUserPosts(
  userId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<PostListResponse> {
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
    `${BACKEND_URL}/api/v1/posts/users/${userId}/posts?${params.toString()}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch user posts" };

    if (response.status === 404) {
      throw new Error(error.detail || "User not found");
    }

    throw new Error(
      error.detail || "Failed to fetch user posts. Please try again."
    );
  }

  const result: PostListResponse = await response.json();
  return result;
}

/**
 * React Query hook to get a paginated list of posts
 */
export function usePosts(
  page: number = 1,
  pageSize: number = 20,
  authorId?: number,
  tagIds?: number[]
) {
  // Sort tag IDs for consistent query key
  const sortedTagIds =
    tagIds && tagIds.length > 0 ? [...tagIds].sort((a, b) => a - b) : undefined;

  return useQuery<PostListResponse>({
    queryKey: ["posts", page, pageSize, authorId, sortedTagIds],
    queryFn: () => listPosts(page, pageSize, authorId, tagIds),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook for infinite scrolling posts list
 * Fetches 12 items per page, loads more on scroll
 */
export function useInfinitePosts(authorId?: number, tagIds?: number[]) {
  // Sort tag IDs for consistent query key
  const sortedTagIds =
    tagIds && tagIds.length > 0 ? [...tagIds].sort((a, b) => a - b) : undefined;

  return useInfiniteQuery<PostListResponse>({
    queryKey: ["posts", "infinite", authorId, sortedTagIds],
    queryFn: ({ pageParam = 1 }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      return listPosts(page, 12, authorId, tagIds);
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
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to get a single post by ID
 */
export function usePost(postId: number | null) {
  return useQuery<PostResponse>({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId!),
    enabled: !!postId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to get all posts by a specific user
 */
export function useUserPosts(
  userId: number | null,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<PostListResponse>({
    queryKey: ["userPosts", userId, page, pageSize],
    queryFn: () => getUserPosts(userId!, page, pageSize),
    enabled: !!userId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query mutation hook for creating a post
 * Invalidates posts list queries on success
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, PostCreate>({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate all posts queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Also invalidate user posts queries
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
}

/**
 * React Query mutation hook for updating a post
 * Invalidates the specific post and posts list queries on success
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, { postId: number; data: PostUpdate }>(
    {
      mutationFn: ({ postId, data }) => updatePost(postId, data),
      onSuccess: (data, variables) => {
        // Invalidate the specific post
        queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
        // Invalidate all posts queries
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        // Invalidate user posts queries
        queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      },
    }
  );
}

/**
 * React Query mutation hook for deleting a post
 * Invalidates posts list queries on success
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deletePost,
    onSuccess: (_, postId) => {
      // Remove the specific post from cache
      queryClient.removeQueries({ queryKey: ["post", postId] });
      // Invalidate all posts queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Invalidate user posts queries
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
}

/**
 * Like a post
 * If already liked, removes the like
 * If disliked, changes to like
 * Requires authentication
 */
export async function likePost(postId: number): Promise<ReactionStats> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/posts/${postId}/like`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to like post" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(error.detail || "Failed to like post. Please try again.");
  }

  const stats: ReactionStats = await response.json();
  return stats;
}

/**
 * Dislike a post
 * If already disliked, removes the dislike
 * If liked, changes to dislike
 * Requires authentication
 */
export async function dislikePost(postId: number): Promise<ReactionStats> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts/${postId}/dislike`,
    {
      method: "POST",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to dislike post" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(
      error.detail || "Failed to dislike post. Please try again."
    );
  }

  const stats: ReactionStats = await response.json();
  return stats;
}

/**
 * Remove reaction from a post
 * Requires authentication
 */
export async function removeReaction(postId: number): Promise<ReactionStats> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts/${postId}/reaction`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: PostError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to remove reaction" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(
      error.detail || "Failed to remove reaction. Please try again."
    );
  }

  const stats: ReactionStats = await response.json();
  return stats;
}

/**
 * React Query mutation hook for liking a post
 * Updates posts list queries on success with optimistic cache updates
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation<ReactionStats, Error, number>({
    mutationFn: likePost,
    onSuccess: (stats, postId) => {
      // Update the specific post in cache
      queryClient.setQueriesData<PostResponse>(
        { queryKey: ["post", postId] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            likes: stats.likes,
            dislikes: stats.dislikes,
            user_reaction: stats.user_reaction,
          };
        }
      );

      // Update post in infinite posts cache
      queryClient.setQueriesData<{
        pages: PostListResponse[];
        pageParams: number[];
      }>({ queryKey: ["posts", "infinite"] }, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === postId
                ? {
                    ...item,
                    likes: stats.likes,
                    dislikes: stats.dislikes,
                    user_reaction: stats.user_reaction,
                  }
                : item
            ),
          })),
        };
      });

      // Update post in regular posts list cache
      queryClient.setQueriesData<PostListResponse>(
        { queryKey: ["posts"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === postId
                ? {
                    ...item,
                    likes: stats.likes,
                    dislikes: stats.dislikes,
                    user_reaction: stats.user_reaction,
                  }
                : item
            ),
          };
        }
      );

      // Update post in user posts cache
      queryClient.setQueriesData<PostListResponse>(
        { queryKey: ["userPosts"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === postId
                ? {
                    ...item,
                    likes: stats.likes,
                    dislikes: stats.dislikes,
                    user_reaction: stats.user_reaction,
                  }
                : item
            ),
          };
        }
      );
    },
  });
}

/**
 * React Query mutation hook for disliking a post
 * Updates posts list queries on success with optimistic cache updates
 */
export function useDislikePost() {
  const queryClient = useQueryClient();

  return useMutation<ReactionStats, Error, number>({
    mutationFn: dislikePost,
    onSuccess: (stats, postId) => {
      // Update the specific post in cache
      queryClient.setQueriesData<PostResponse>(
        { queryKey: ["post", postId] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            likes: stats.likes,
            dislikes: stats.dislikes,
            user_reaction: stats.user_reaction,
          };
        }
      );

      // Update post in infinite posts cache
      queryClient.setQueriesData<{
        pages: PostListResponse[];
        pageParams: number[];
      }>({ queryKey: ["posts", "infinite"] }, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === postId
                ? {
                    ...item,
                    likes: stats.likes,
                    dislikes: stats.dislikes,
                    user_reaction: stats.user_reaction,
                  }
                : item
            ),
          })),
        };
      });

      // Update post in regular posts list cache
      queryClient.setQueriesData<PostListResponse>(
        { queryKey: ["posts"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === postId
                ? {
                    ...item,
                    likes: stats.likes,
                    dislikes: stats.dislikes,
                    user_reaction: stats.user_reaction,
                  }
                : item
            ),
          };
        }
      );

      // Update post in user posts cache
      queryClient.setQueriesData<PostListResponse>(
        { queryKey: ["userPosts"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === postId
                ? {
                    ...item,
                    likes: stats.likes,
                    dislikes: stats.dislikes,
                    user_reaction: stats.user_reaction,
                  }
                : item
            ),
          };
        }
      );

      // Don't invalidate - matches useLikePost pattern which works correctly
      // The mutation response already contains correct data, and cache update is sufficient
    },
  });
}

/**
 * React Query mutation hook for removing reaction from a post
 * Updates posts list queries on success
 */
export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation<ReactionStats, Error, number>({
    mutationFn: removeReaction,
    onSuccess: (_, postId) => {
      // Invalidate all posts queries to refetch with updated reaction counts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
}
