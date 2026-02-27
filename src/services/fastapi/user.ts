import { useQuery } from "@tanstack/react-query";
import type { UserPublicResponse } from "@/type/fastapi/user";
import type { GroupListWithCountsResponse } from "@/type/fastapi/groups";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Get public profile for a user by ID.
 * GET /api/v1/users/{user_id}
 * Returns 404 if user does not exist or is inactive.
 */
export async function getUserById(
  userId: number,
): Promise<UserPublicResponse> {
  const response = await fetch(`${BACKEND_URL}/api/v1/users/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail =
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to fetch user";
    if (response.status === 404) {
      throw new Error("404: User not found");
    }
    throw new Error(detail);
  }

  return response.json();
}

/**
 * List groups for a user (owned and active member of).
 * GET /api/v1/users/{user_id}/groups
 * Excludes pending and banned. Each item includes is_owner relative to that user.
 */
export async function getUserGroups(
  userId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<GroupListWithCountsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const response = await fetch(
    `${BACKEND_URL}/api/v1/users/${userId}/groups?${params.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail =
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to fetch user groups";
    if (response.status === 404) {
      throw new Error("404: User not found");
    }
    throw new Error(detail);
  }

  return response.json();
}

/**
 * React Query hook for a user's public profile by ID.
 */
export function useUser(userId: number | null) {
  return useQuery<UserPublicResponse>({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: userId != null && userId > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook for groups belonging to a user (by user ID).
 */
export function useUserGroupsByUserId(
  userId: number | null,
  page: number = 1,
  pageSize: number = 20,
) {
  return useQuery<GroupListWithCountsResponse>({
    queryKey: ["userGroupsByUserId", userId, page, pageSize],
    queryFn: () => getUserGroups(userId!, page, pageSize),
    enabled: userId != null && userId > 0,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Re-export upload user icon/avatar API (implementation in user-email.ts). */
export {
  uploadUserIcon,
  useUploadUserIcon,
} from "./user-email";
export type { UploadIconResponse } from "./user-email";
