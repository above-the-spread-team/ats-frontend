import type { NotificationItem } from "@/type/fastapi/notification";

/**
 * Returns a human-readable message for a notification (e.g. "Alice liked your post").
 */
export function formatNotificationMessage(item: NotificationItem): string {
  const sender = item.sender?.username ?? "Someone";
  const type = item.notification_type;
  switch (type) {
    case "like":
      return `${sender} liked your post`;
    case "like_comment":
      return `${sender} liked your comment`;
    case "comment":
      return `${sender} commented on your post`;
    case "reply_to_comment":
      return `${sender} replied to your comment`;
    case "follow_request":
      return `${sender} requested to follow a group`;
    case "follow_approved":
      return `You were approved to join a group`;
    case "follow_rejected":
      return `Your request to join a group was declined`;
    case "banned":
      return `You were removed from a group`;
    case "group_deleted":
      return `A group you were in was deleted`;
    default:
      return `${sender} — ${type.replace(/_/g, " ")}`;
  }
}

/**
 * Returns the app route for a notification (post page, group page, or null).
 */
export function getNotificationLink(item: NotificationItem): string | null {
  const meta = item.metadata;
  if (!meta) return null;
  if (typeof meta.post_id === "number") return `/discuss/${meta.post_id}`;
  if (typeof meta.group_id === "number")
    return `/discuss/group-posts/${meta.group_id}`;
  return null;
}
