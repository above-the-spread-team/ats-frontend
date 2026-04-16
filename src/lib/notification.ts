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
    case "new_follower":
      return `${sender} followed your group`;
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
    case "prediction_result": {
      const meta = item.metadata;
      if (
        meta &&
        typeof meta.home_team === "string" &&
        typeof meta.away_team === "string"
      ) {
        return `Your prediction for ${meta.home_team} vs ${meta.away_team} was correct!`;
      }
      return "Your fixture prediction was correct!";
    }
    default:
      return `${sender} — ${type.replace(/_/g, " ")}`;
  }
}

/**
 * Returns the app route for a notification (post page, group page, or null).
 * follow_request goes straight to the pending tab so owners can act immediately.
 */
export function getNotificationLink(item: NotificationItem): string | null {
  const meta = item.metadata;
  if (!meta) return null;
  if (typeof meta.post_id === "number") return `/discuss/${meta.post_id}`;
  if (typeof meta.fixture_id === "number")
    return `/games/detail?id=${meta.fixture_id}`;
  if (typeof meta.group_id === "number") {
    const base = `/discuss/group-posts/${meta.group_id}`;
    if (item.notification_type === "follow_request")
      return `${base}?view=pending`;
    return base;
  }
  return null;
}
