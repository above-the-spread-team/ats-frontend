import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeader } from "./token-storage";
import type {
  NotificationListResponse,
  UnreadCountResponse,
  MarkReadRequest,
} from "@/type/fastapi/notification";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const NOTIFICATIONS_PREFIX = `${BACKEND_URL}/api/v1/notifications`;

/** Single source for notification timing: 3 minutes. Used for poll interval (toasts), stale time (list, unread count, poll). */
const NOTIFICATION_STALE_TIME_MS = 3 * 60 * 1000;

async function fetchNotifications(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(authHeader && { Authorization: authHeader }),
    ...options.headers,
  };
  return fetch(url, { ...options, credentials: "include", headers });
}

/**
 * List notifications for the current user.
 * GET /api/v1/notifications
 * @param sinceMinutes - If set (1–60), only notifications created in the last N minutes (for polling recent unread).
 */
export async function listNotifications(
  page: number = 1,
  pageSize: number = 20,
  unreadOnly: boolean = false,
  sinceMinutes?: number,
): Promise<NotificationListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    unread_only: unreadOnly.toString(),
  });
  if (sinceMinutes != null && sinceMinutes >= 1 && sinceMinutes <= 60) {
    params.set("since_minutes", sinceMinutes.toString());
  }
  const response = await fetchNotifications(
    `${NOTIFICATIONS_PREFIX}?${params.toString()}`,
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail =
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to fetch notifications";
    if (response.status === 401) throw new Error("401: Unauthorized");
    throw new Error(detail);
  }
  return response.json();
}

/**
 * Mark notifications as read.
 * PATCH /api/v1/notifications/read
 */
export async function markNotificationsRead(
  body: MarkReadRequest,
): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(authHeader && { Authorization: authHeader }),
  };
  const response = await fetch(`${NOTIFICATIONS_PREFIX}/read`, {
    method: "PATCH",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail =
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to mark notifications as read";
    if (response.status === 401) throw new Error("401: Unauthorized");
    throw new Error(detail);
  }
}

/**
 * Get unread notification count.
 * GET /api/v1/notifications/unread-count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await fetchNotifications(
    `${NOTIFICATIONS_PREFIX}/unread-count`,
  );
  if (!response.ok) {
    if (response.status === 401) throw new Error("401: Unauthorized");
    throw new Error("Failed to fetch unread count");
  }
  return response.json();
}

export function useNotifications(
  page: number = 1,
  pageSize: number = 20,
  unreadOnly: boolean = false,
  sinceMinutes?: number,
  enabled: boolean = true,
) {
  return useQuery<NotificationListResponse>({
    queryKey: ["notifications", page, pageSize, unreadOnly, sinceMinutes],
    queryFn: () => listNotifications(page, pageSize, unreadOnly, sinceMinutes),
    staleTime: NOTIFICATION_STALE_TIME_MS,
    refetchOnWindowFocus: true,
    enabled,
  });
}

/**
 * Poll for unread notifications (for toasts). "New" is determined on the frontend via last-seen id in localStorage.
 * Use refetchOnWindowFocus: false so we don’t double-toast on tab focus.
 */
export function useRecentUnreadPoll(enabled: boolean = true) {
  return useQuery<NotificationListResponse>({
    queryKey: ["notifications", "recentPoll", 1, 20, true],
    queryFn: () => listNotifications(1, 20, true),
    refetchInterval: NOTIFICATION_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    staleTime: NOTIFICATION_STALE_TIME_MS,
    enabled,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MarkReadRequest>({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unreadCount"],
      });
    },
  });
}

export function useUnreadCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: ["notifications", "unreadCount"],
    queryFn: getUnreadCount,
    staleTime: NOTIFICATION_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
}
