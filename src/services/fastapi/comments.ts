import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CommentCreate,
  CommentUpdate,
  CommentResponse,
  CommentListResponse,
  CommentError,
} from "@/type/fastapi/comments";
import { getAuthHeader } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Create a new comment on a post
 * Requires authentication
 */
export async function createComment(
  postId: number,
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
    `${BACKEND_URL}/api/v1/posts/${postId}/comments`,
    {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

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
          : "Invalid comment data"
      );
    }

    const error: CommentError =
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
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(
      error.detail || "Failed to create comment. Please try again."
    );
  }

  const comment: CommentResponse = await response.json();
  return comment;
}

/**
 * Get comments for a post
 * Optionally filter by page and include replies
 */
export async function listComments(
  postId: number,
  page: number = 1,
  pageSize: number = 20,
  includeReplies: boolean = false
): Promise<CommentListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    include_replies: includeReplies.toString(),
  });

  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts/${postId}/comments?${params.toString()}`,
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
    const error: CommentError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch comments" };

    if (response.status === 404) {
      throw new Error(error.detail || "Post not found");
    }

    throw new Error(
      error.detail || "Failed to fetch comments. Please try again."
    );
  }

  const result: CommentListResponse = await response.json();
  return result;
}

/**
 * Get a single comment by ID
 */
export async function getComment(commentId: number): Promise<CommentResponse> {
  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts/comments/${commentId}`,
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
    const error: CommentError =
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
 * Update a comment
 * Requires authentication - only the comment author can update
 */
export async function updateComment(
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
    `${BACKEND_URL}/api/v1/posts/comments/${commentId}`,
    {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

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
          : "Invalid comment data"
      );
    }

    const error: CommentError =
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
 * Delete a comment
 * Requires authentication - only the comment author can delete
 */
export async function deleteComment(commentId: number): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts/comments/${commentId}`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: CommentError =
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

/**
 * Get replies for a specific top-level comment (lazy loading)
 * Use this endpoint when user clicks "View replies"
 */
export async function getCommentReplies(
  commentId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<CommentListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts/comments/${commentId}/replies?${params.toString()}`,
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
    const error: CommentError =
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
 * React Query hook to get comments for a post
 * By default, only returns top-level comments (includeReplies = false)
 * Replies are loaded separately using useCommentReplies hook
 */
export function useComments(
  postId: number | null,
  page: number = 1,
  pageSize: number = 20,
  includeReplies: boolean = false
) {
  return useQuery<CommentListResponse>({
    queryKey: ["comments", postId, page, pageSize, includeReplies],
    queryFn: () => listComments(postId!, page, pageSize, includeReplies),
    enabled: !!postId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to get replies for a specific top-level comment (lazy loading)
 * Use this when user clicks "View replies" on a comment
 */
export function useCommentReplies(
  commentId: number | null,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<CommentListResponse>({
    queryKey: ["commentReplies", commentId, page, pageSize],
    queryFn: () => getCommentReplies(commentId!, page, pageSize),
    enabled: !!commentId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to get a single comment by ID
 */
export function useComment(commentId: number | null) {
  return useQuery<CommentResponse>({
    queryKey: ["comment", commentId],
    queryFn: () => getComment(commentId!),
    enabled: !!commentId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query mutation hook for creating a comment
 * Invalidates comments queries on success
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponse,
    Error,
    { postId: number; data: CommentCreate }
  >({
    mutationFn: ({ postId, data }) => createComment(postId, data),
    onSuccess: (_, variables) => {
      // Invalidate comments for the post
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      // Also invalidate posts to update comment count
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postId],
      });
    },
  });
}

/**
 * React Query mutation hook for updating a comment
 * Invalidates the specific comment and comments list queries on success
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponse,
    Error,
    { commentId: number; data: CommentUpdate }
  >({
    mutationFn: ({ commentId, data }) => updateComment(commentId, data),
    onSuccess: (data, variables) => {
      // Invalidate the specific comment
      queryClient.invalidateQueries({
        queryKey: ["comment", variables.commentId],
      });
      // Invalidate comments for the post
      queryClient.invalidateQueries({
        queryKey: ["comments", data.post_id],
      });
    },
  });
}

/**
 * React Query mutation hook for deleting a comment
 * Invalidates comments list queries on success
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { commentId: number; postId: number }>({
    mutationFn: ({ commentId }) => deleteComment(commentId),
    onSuccess: (_, variables) => {
      // Remove the specific comment from cache
      queryClient.removeQueries({
        queryKey: ["comment", variables.commentId],
      });
      // Invalidate comments for the post
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      // Also invalidate posts to update comment count
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postId],
      });
    },
  });
}

/**
 * Like a comment
 * If already liked, removes the like
 * If disliked, changes to like
 * Requires authentication
 */
export async function likeComment(commentId: number): Promise<CommentResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/posts/comments/${commentId}/like`,
    {
      method: "POST",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: CommentError =
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
 * Dislike a comment
 * If already disliked, removes the dislike
 * If liked, changes to dislike
 * Requires authentication
 */
export async function dislikeComment(
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
    `${BACKEND_URL}/api/v1/posts/comments/${commentId}/dislike`,
    {
      method: "POST",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: CommentError =
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
 * Remove reaction from a comment
 * Requires authentication
 */
export async function removeCommentReaction(
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
    `${BACKEND_URL}/api/v1/posts/comments/${commentId}/reaction`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: CommentError =
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

/**
 * React Query mutation hook for liking a comment
 * Updates comments queries on success
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, number>({
    mutationFn: likeComment,
    onSuccess: (data, commentId) => {
      // Invalidate comments for the post to refetch with updated reaction counts
      queryClient.invalidateQueries({
        queryKey: ["comments", data.post_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["comment", commentId],
      });
    },
  });
}

/**
 * React Query mutation hook for disliking a comment
 * Updates comments queries on success
 */
export function useDislikeComment() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, number>({
    mutationFn: dislikeComment,
    onSuccess: (data, commentId) => {
      // Invalidate comments for the post to refetch with updated reaction counts
      queryClient.invalidateQueries({
        queryKey: ["comments", data.post_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["comment", commentId],
      });
    },
  });
}

/**
 * React Query mutation hook for removing reaction from a comment
 * Updates comments queries on success
 */
export function useRemoveCommentReaction() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, number>({
    mutationFn: removeCommentReaction,
    onSuccess: (data, commentId) => {
      // Invalidate comments for the post to refetch with updated reaction counts
      queryClient.invalidateQueries({
        queryKey: ["comments", data.post_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["comment", commentId],
      });
    },
  });
}
