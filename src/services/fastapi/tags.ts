import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TagCreate,
  TagUpdate,
  TagResponse,
  TagListResponse,
  TagSummary,
  ContentTagsCreate,
  ContentTagsUpdate,
  AutoTagRequest,
  TagType,
  TagError,
} from "@/type/fastapi/tags";
import { getAuthHeader } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Create a new tag
 * Requires authentication and TAG_CREATE permission
 */
export async function createTag(data: TagCreate): Promise<TagResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

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
          : "Invalid tag data"
      );
    }

    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to create tag" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }

    throw new Error(error.detail || "Failed to create tag. Please try again.");
  }

  const tag: TagResponse = await response.json();
  return tag;
}

/**
 * Get a paginated list of tags
 * Optionally filter by tag_type and search
 */
export async function listTags(
  page: number = 1,
  pageSize: number = 20,
  tagType?: TagType,
  search?: string
): Promise<TagListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (tagType) {
    params.append("tag_type", tagType);
  }
  if (search) {
    params.append("search", search);
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/tags?${params.toString()}`,
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
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch tags" };
    throw new Error(error.detail || "Failed to fetch tags. Please try again.");
  }

  const data: TagListResponse = await response.json();
  return data;
}

/**
 * Get a tag by ID
 */
export async function getTag(tagId: number): Promise<TagResponse> {
  const response = await fetch(`${BACKEND_URL}/api/v1/tags/${tagId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch tag" };

    if (response.status === 404) {
      throw new Error("Tag not found");
    }

    throw new Error(error.detail || "Failed to fetch tag. Please try again.");
  }

  const tag: TagResponse = await response.json();
  return tag;
}

/**
 * Update a tag
 * Requires authentication and TAG_UPDATE permission
 */
export async function updateTag(
  tagId: number,
  data: TagUpdate
): Promise<TagResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/${tagId}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

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
          : "Invalid tag data"
      );
    }

    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to update tag" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("Tag not found");
    }

    throw new Error(error.detail || "Failed to update tag. Please try again.");
  }

  const tag: TagResponse = await response.json();
  return tag;
}

/**
 * Delete a tag
 * Requires authentication and TAG_DELETE permission
 */
export async function deleteTag(tagId: number): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/${tagId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to delete tag" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("Tag not found");
    }

    throw new Error(error.detail || "Failed to delete tag. Please try again.");
  }
}

/**
 * Add tags to a post
 * Requires authentication (post author, manager, or admin)
 */
export async function addTagsToPost(
  postId: number,
  data: ContentTagsCreate
): Promise<TagSummary[]> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/posts/${postId}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to add tags to post" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("Post not found");
    }

    throw new Error(
      error.detail || "Failed to add tags to post. Please try again."
    );
  }

  const tags: TagSummary[] = await response.json();
  return tags;
}

/**
 * Update (replace) tags for a post
 * Requires authentication (post author, manager, or admin)
 */
export async function updatePostTags(
  postId: number,
  data: ContentTagsUpdate
): Promise<TagSummary[]> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/posts/${postId}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to update post tags" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("Post not found");
    }

    throw new Error(
      error.detail || "Failed to update post tags. Please try again."
    );
  }

  const tags: TagSummary[] = await response.json();
  return tags;
}

/**
 * Get all tags for a post
 */
export async function getPostTags(postId: number): Promise<TagSummary[]> {
  const response = await fetch(`${BACKEND_URL}/api/v1/tags/posts/${postId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch post tags" };

    if (response.status === 404) {
      throw new Error("Post not found");
    }

    throw new Error(
      error.detail || "Failed to fetch post tags. Please try again."
    );
  }

  const tags: TagSummary[] = await response.json();
  return tags;
}

/**
 * Remove tags from a post
 * Requires authentication (post author, manager, or admin)
 */
export async function removeTagsFromPost(
  postId: number,
  data: ContentTagsCreate
): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/posts/${postId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to remove tags from post" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("Post not found");
    }

    throw new Error(
      error.detail || "Failed to remove tags from post. Please try again."
    );
  }
}

/**
 * Add tags to news
 * Requires authentication (news author, manager, or admin)
 */
export async function addTagsToNews(
  newsId: number,
  data: ContentTagsCreate
): Promise<TagSummary[]> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/news/${newsId}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to add tags to news" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("News not found");
    }

    throw new Error(
      error.detail || "Failed to add tags to news. Please try again."
    );
  }

  const tags: TagSummary[] = await response.json();
  return tags;
}

/**
 * Update (replace) tags for news
 * Requires authentication (news author, manager, or admin)
 */
export async function updateNewsTags(
  newsId: number,
  data: ContentTagsUpdate
): Promise<TagSummary[]> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/news/${newsId}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to update news tags" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("News not found");
    }

    throw new Error(
      error.detail || "Failed to update news tags. Please try again."
    );
  }

  const tags: TagSummary[] = await response.json();
  return tags;
}

/**
 * Get all tags for news
 */
export async function getNewsTags(newsId: number): Promise<TagSummary[]> {
  const response = await fetch(`${BACKEND_URL}/api/v1/tags/news/${newsId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch news tags" };

    if (response.status === 404) {
      throw new Error("News not found");
    }

    throw new Error(
      error.detail || "Failed to fetch news tags. Please try again."
    );
  }

  const tags: TagSummary[] = await response.json();
  return tags;
}

/**
 * Remove tags from news
 * Requires authentication (news author, manager, or admin)
 */
export async function removeTagsFromNews(
  newsId: number,
  data: ContentTagsCreate
): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/tags/news/${newsId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to remove tags from news" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 404) {
      throw new Error("News not found");
    }

    throw new Error(
      error.detail || "Failed to remove tags from news. Please try again."
    );
  }
}

/**
 * Auto-tag content using AI/NLP
 */
export async function autoTagContent(
  data: AutoTagRequest
): Promise<TagSummary[]> {
  const response = await fetch(`${BACKEND_URL}/api/v1/tags/auto-tag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: TagError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to auto-tag content" };

    throw new Error(
      error.detail || "Failed to auto-tag content. Please try again."
    );
  }

  const tags: TagSummary[] = await response.json();
  return tags;
}

// React Query Hooks

/**
 * Hook to list tags with optional filtering
 * Automatically fetches all pages to ensure all tags are loaded
 */
export function useTags(
  pageSize: number = 100,
  tagType?: TagType,
  search?: string
) {
  return useQuery<TagListResponse, Error>({
    queryKey: ["tags", "all", tagType, search],
    queryFn: async () => {
      // First request to get total pages
      const firstPage = await listTags(1, pageSize, tagType, search);
      const allTags: TagResponse[] = [...firstPage.items];

      // If there are more pages, fetch them all
      if (firstPage.total_pages > 1) {
        const remainingPages = Array.from(
          { length: firstPage.total_pages - 1 },
          (_, i) => i + 2
        );

        const remainingPromises = remainingPages.map((pageNum) =>
          listTags(pageNum, pageSize, tagType, search)
        );

        const remainingResults = await Promise.all(remainingPromises);
        remainingResults.forEach((result) => {
          allTags.push(...result.items);
        });
      }

      // Return combined response with all tags
      return {
        items: allTags,
        total: allTags.length,
        page: 1,
        page_size: allTags.length,
        total_pages: 1,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a single tag by ID
 */
export function useTag(tagId: number) {
  return useQuery<TagResponse, Error>({
    queryKey: ["tags", tagId],
    queryFn: () => getTag(tagId),
    enabled: !!tagId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get tags for a post
 */
export function usePostTags(postId: number) {
  return useQuery<TagSummary[], Error>({
    queryKey: ["tags", "posts", postId],
    queryFn: () => getPostTags(postId),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get tags for news
 */
export function useNewsTags(newsId: number) {
  return useQuery<TagSummary[], Error>({
    queryKey: ["tags", "news", newsId],
    queryFn: () => getNewsTags(newsId),
    enabled: !!newsId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation<TagResponse, Error, TagCreate>({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

/**
 * Hook to update a tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation<TagResponse, Error, { tagId: number; data: TagUpdate }>({
    mutationFn: ({ tagId, data }) => updateTag(tagId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tags", variables.tagId] });
    },
  });
}

/**
 * Hook to delete a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

/**
 * Hook to add tags to a post
 */
export function useAddTagsToPost() {
  const queryClient = useQueryClient();
  return useMutation<
    TagSummary[],
    Error,
    { postId: number; data: ContentTagsCreate }
  >({
    mutationFn: ({ postId, data }) => addTagsToPost(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tags", "posts", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Hook to update (replace) tags for a post
 */
export function useUpdatePostTags() {
  const queryClient = useQueryClient();
  return useMutation<
    TagSummary[],
    Error,
    { postId: number; data: ContentTagsUpdate }
  >({
    mutationFn: ({ postId, data }) => updatePostTags(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tags", "posts", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Hook to remove tags from a post
 */
export function useRemoveTagsFromPost() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: number; data: ContentTagsCreate }>({
    mutationFn: ({ postId, data }) => removeTagsFromPost(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tags", "posts", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * Hook to add tags to news
 */
export function useAddTagsToNews() {
  const queryClient = useQueryClient();
  return useMutation<
    TagSummary[],
    Error,
    { newsId: number; data: ContentTagsCreate }
  >({
    mutationFn: ({ newsId, data }) => addTagsToNews(newsId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tags", "news", variables.newsId],
      });
      queryClient.invalidateQueries({ queryKey: ["news", variables.newsId] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

/**
 * Hook to update (replace) tags for news
 */
export function useUpdateNewsTags() {
  const queryClient = useQueryClient();
  return useMutation<
    TagSummary[],
    Error,
    { newsId: number; data: ContentTagsUpdate }
  >({
    mutationFn: ({ newsId, data }) => updateNewsTags(newsId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tags", "news", variables.newsId],
      });
      queryClient.invalidateQueries({ queryKey: ["news", variables.newsId] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

/**
 * Hook to remove tags from news
 */
export function useRemoveTagsFromNews() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { newsId: number; data: ContentTagsCreate }>({
    mutationFn: ({ newsId, data }) => removeTagsFromNews(newsId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tags", "news", variables.newsId],
      });
      queryClient.invalidateQueries({ queryKey: ["news", variables.newsId] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

/**
 * Hook to auto-tag content
 */
export function useAutoTag() {
  return useMutation<TagSummary[], Error, AutoTagRequest>({
    mutationFn: autoTagContent,
  });
}
