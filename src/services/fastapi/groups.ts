import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  GroupCreate,
  GroupUpdate,
  GroupResponse,
  GroupListResponse,
  GroupPublicListResponse,
  GroupMemberAddRequest,
  GroupMemberListResponse,
  GroupError,
} from "@/type/fastapi/groups";
import type { PostListResponse } from "@/type/fastapi/posts";
import { listPosts } from "./posts";
import { getAuthHeader } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Create a new group
 * Requires authentication
 * Max 5 groups per user
 */
export async function createGroup(data: GroupCreate): Promise<GroupResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/groups`, {
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
          : "Invalid group data"
      );
    }

    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to create group" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Permission denied");
    }
    if (response.status === 400) {
      throw new Error(error.detail || "Group limit reached (max 5 groups per user)");
    }

    throw new Error(error.detail || "Failed to create group. Please try again.");
  }

  const group: GroupResponse = await response.json();
  return group;
}

/**
 * Update a group
 * Requires authentication - only the group owner can update
 */
export async function updateGroup(
  groupId: number,
  data: GroupUpdate
): Promise<GroupResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/groups/${groupId}`, {
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
          : "Invalid group data"
      );
    }

    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to update group" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Only the group owner can update this group");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group not found");
    }

    throw new Error(error.detail || "Failed to update group. Please try again.");
  }

  const group: GroupResponse = await response.json();
  return group;
}

/**
 * Upload group icon image
 * Requires authentication - only the group owner can upload
 */
export async function uploadGroupIcon(
  groupId: number,
  file: File
): Promise<GroupResponse> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  // Create FormData
  const formData = new FormData();
  formData.append("file", file);

  // Get auth header for Safari compatibility (falls back to cookies if not available)
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {};
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/groups/${groupId}/icon`,
    {
      method: "POST",
      credentials: "include", // Include HttpOnly cookie (for non-Safari browsers)
      headers,
      body: formData, // Don't set Content-Type header - browser will set it with boundary
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to upload image" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 400) {
      throw new Error(error.detail || "Invalid file");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Only the group owner can upload icon");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group not found");
    }

    throw new Error(
      error.detail || "Failed to upload image. Please try again."
    );
  }

  const group: GroupResponse = await response.json();
  return group;
}

/**
 * Get a single group by ID
 * Public groups are visible to everyone; private groups are members-only
 */
export async function getGroup(groupId: number): Promise<GroupResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/groups/${groupId}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch group" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to view this group"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group not found");
    }

    throw new Error(
      error.detail || "Failed to fetch group. Please try again."
    );
  }

  const group: GroupResponse = await response.json();
  return group;
}

/**
 * Delete a group
 * Requires authentication - only the group owner can delete
 */
export async function deleteGroup(groupId: number): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/groups/${groupId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to delete group" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "Only the group owner can delete this group"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group not found");
    }

    throw new Error(error.detail || "Failed to delete group. Please try again.");
  }
}

/**
 * Follow a public group
 * Requires authentication - allows users to follow public groups
 */
export async function followGroup(groupId: number): Promise<GroupResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/groups/${groupId}/follow`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to follow group" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to follow this group"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group not found");
    }
    if (response.status === 400) {
      throw new Error(
        error.detail || "You are already following this group"
      );
    }

    throw new Error(
      error.detail || "Failed to follow group. Please try again."
    );
  }

  const group: GroupResponse = await response.json();
  return group;
}

/**
 * Unfollow a group
 * Requires authentication - allows users to unfollow groups they previously followed
 */
export async function unfollowGroup(groupId: number): Promise<GroupResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/groups/${groupId}/follow`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to unfollow group" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to unfollow this group"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group not found");
    }
    if (response.status === 400) {
      throw new Error(
        error.detail || "You are not following this group"
      );
    }

    throw new Error(
      error.detail || "Failed to unfollow group. Please try again."
    );
  }

  const group: GroupResponse = await response.json();
  return group;
}

/**
 * Add a member to a group
 * Requires authentication - only the group owner can add members
 */
export async function addGroupMember(
  groupId: number,
  data: GroupMemberAddRequest
): Promise<GroupResponse> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/groups/${groupId}/members`,
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
          : "Invalid request data"
      );
    }

    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to add member" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "Only the group owner can add members");
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group or user not found");
    }

    throw new Error(
      error.detail || "Failed to add member. Please try again."
    );
  }

  const group: GroupResponse = await response.json();
  return group;
}

/**
 * Remove a member from a group
 * Requires authentication - owner can kick, members can leave
 */
export async function removeGroupMember(
  groupId: number,
  userId: number
): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1/groups/${groupId}/members/${userId}`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to remove member" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "Only the group owner can remove other members"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group or member not found");
    }
    if (response.status === 400) {
      throw new Error(error.detail || "Group owner cannot be removed");
    }

    throw new Error(
      error.detail || "Failed to remove member. Please try again."
    );
  }
}

/**
 * List group members
 * Public groups are visible to everyone; private groups are members-only
 * Returns paginated list of members with id, username, avatar_url
 */
export async function listGroupMembers(
  groupId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<GroupMemberListResponse> {
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
    `${BACKEND_URL}/api/v1/groups/${groupId}/members?${params.toString()}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch group members" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 403) {
      throw new Error(
        error.detail || "You don't have permission to view this group"
      );
    }
    if (response.status === 404) {
      throw new Error(error.detail || "Group not found");
    }

    throw new Error(
      error.detail || "Failed to fetch group members. Please try again."
    );
  }

  const result: GroupMemberListResponse = await response.json();
  return result;
}


/**
 * List all groups for the current user (owned and member of)
 * Requires authentication
 * Supports pagination
 */
export async function listUserGroups(
  page: number = 1,
  pageSize: number = 20
): Promise<GroupListResponse> {
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
    `${BACKEND_URL}/api/v1/groups?${params.toString()}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch groups" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }

    throw new Error(
      error.detail || "Failed to fetch groups. Please try again."
    );
  }

  const result: GroupListResponse = await response.json();
  return result;
}

/**
 * List all public groups (for searching/discovering groups)
 * Does not require authentication
 * Returns groups with member counts
 * Supports pagination
 */
export async function listAllGroups(
  page: number = 1,
  pageSize: number = 20
): Promise<GroupPublicListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const response = await fetch(
    `${BACKEND_URL}/api/v1/groups/all?${params.toString()}`,
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
    const error: GroupError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to fetch groups" };

    throw new Error(
      error.detail || "Failed to fetch groups. Please try again."
    );
  }

  const result: GroupPublicListResponse = await response.json();
  return result;
}

/**
 * React Query mutation hook for creating a group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation<GroupResponse, Error, GroupCreate>({
    mutationFn: createGroup,
    onSuccess: () => {
      // Invalidate any group-related queries
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
    },
  });
}

/**
 * React Query mutation hook for updating a group
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation<
    GroupResponse,
    Error,
    { groupId: number; data: GroupUpdate }
  >({
    mutationFn: ({ groupId, data }) => updateGroup(groupId, data),
    onSuccess: (_, variables) => {
      // Invalidate any group-related queries
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
  });
}

/**
 * React Query mutation hook for uploading group icon
 */
export function useUploadGroupIcon() {
  const queryClient = useQueryClient();

  return useMutation<GroupResponse, Error, { groupId: number; file: File }>({
    mutationFn: ({ groupId, file }) => uploadGroupIcon(groupId, file),
    onSuccess: (_, variables) => {
      // Invalidate any group-related queries
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
  });
}

/**
 * React Query mutation hook for deleting a group
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteGroup,
    onSuccess: () => {
      // Invalidate any group-related queries
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
    },
  });
}

/**
 * React Query mutation hook for following a public group
 */
export function useFollowGroup() {
  const queryClient = useQueryClient();

  return useMutation<GroupResponse, Error, number>({
    mutationFn: (groupId) => followGroup(groupId),
    onSuccess: (_, groupId) => {
      // Invalidate group queries to refetch with updated members
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["allGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
    },
  });
}

/**
 * React Query mutation hook for unfollowing a group
 */
export function useUnfollowGroup() {
  const queryClient = useQueryClient();

  return useMutation<GroupResponse, Error, number>({
    mutationFn: (groupId) => unfollowGroup(groupId),
    onSuccess: (_, groupId) => {
      // Invalidate group queries to refetch with updated members
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["allGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
    },
  });
}

/**
 * React Query mutation hook for adding a member to a group
 */
export function useAddGroupMember() {
  const queryClient = useQueryClient();

  return useMutation<
    GroupResponse,
    Error,
    { groupId: number; data: GroupMemberAddRequest }
  >({
    mutationFn: ({ groupId, data }) => addGroupMember(groupId, data),
    onSuccess: (_, variables) => {
      // Invalidate group queries to refetch with updated members
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

/**
 * React Query mutation hook for removing a member from a group
 */
export function useRemoveGroupMember() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { groupId: number; userId: number }>({
    mutationFn: ({ groupId, userId }) => removeGroupMember(groupId, userId),
    onSuccess: (_, variables) => {
      // Invalidate group queries to refetch with updated members
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] });
    },
  });
}

/**
 * React Query hook to list posts in a group
 * Uses the unified listPosts function with groupId parameter
 */
export function useGroupPosts(
  groupId: number | null,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<PostListResponse>({
    queryKey: ["groupPosts", groupId, page, pageSize],
    queryFn: () => listPosts(page, pageSize, undefined, groupId || undefined),
    enabled: !!groupId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to list all groups for the current user
 * Supports pagination
 */
export function useUserGroups(page: number = 1, pageSize: number = 20) {
  return useQuery<GroupListResponse>({
    queryKey: ["userGroups", page, pageSize],
    queryFn: () => listUserGroups(page, pageSize),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to get a single group by ID
 */
export function useGroup(groupId: number | null) {
  return useQuery<GroupResponse>({
    queryKey: ["group", groupId],
    queryFn: () => getGroup(groupId!),
    enabled: !!groupId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to list all public groups (for searching/discovering)
 * Does not require authentication
 * Supports pagination
 */
export function useAllGroups(page: number = 1, pageSize: number = 20) {
  return useQuery<GroupPublicListResponse>({
    queryKey: ["allGroups", page, pageSize],
    queryFn: () => listAllGroups(page, pageSize),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to list group members
 * Public groups are visible to everyone; private groups are members-only
 * Supports pagination
 */
export function useGroupMembers(
  groupId: number | null,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<GroupMemberListResponse>({
    queryKey: ["groupMembers", groupId, page, pageSize],
    queryFn: () => listGroupMembers(groupId!, page, pageSize),
    enabled: !!groupId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}
