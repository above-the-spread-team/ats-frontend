/**
 * Notification types matching backend schemas
 */

export interface SenderSummary {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface NotificationItem {
  id: number;
  notification_type: string;
  sender: SenderSummary | null;
  metadata: Record<string, unknown> | null;
  /** Group icon URL when the notification is from a group (follow, ban, etc.). */
  group_avatar_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MarkReadRequest {
  notification_ids: number[];
}

export interface UnreadCountResponse {
  unread_count: number;
}
