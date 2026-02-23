"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaBell } from "react-icons/fa";
import Link from "next/link";
import UserIcon from "@/components/common/user-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useUnreadCount,
  useNotifications,
  useRecentUnreadPoll,
  useMarkNotificationsRead,
} from "@/services/fastapi/notification";
import type { NotificationItem } from "@/type/fastapi/notification";
import { formatTimeAgo } from "@/app/(features)/discuss/_components/comment-item";

export function formatNotificationMessage(item: NotificationItem): string {
  const sender = item.sender?.username ?? "Someone";
  const type = item.notification_type;
  switch (type) {
    case "like":
      return `${sender} liked your post`;
    case "comment":
      return `${sender} commented on your post`;
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

export function getNotificationLink(item: NotificationItem): string | null {
  const meta = item.metadata;
  if (!meta) return null;
  if (typeof meta.post_id === "number") return `/discuss/${meta.post_id}`;
  if (typeof meta.group_id === "number")
    return `/discuss/group-posts/${meta.group_id}`;
  return null;
}

/** Toast content: avatar + message, used for notification toasts. */
export function NotificationToastContent({
  message,
  avatarUrl,
  name,
  variant = "primary",
}: {
  message: string;
  avatarUrl: string | null;
  name: string;
  variant?: "primary" | "muted";
}) {
  return (
    <div className="flex items-center gap-3 p-3 min-w-0">
      <UserIcon
        avatarUrl={avatarUrl}
        name={name}
        size="small"
        variant={variant}
        className="!h-10 !w-10 flex-shrink-0 ring-2 ring-border/50"
      />
      <p className="text-sm font-medium text-foreground line-clamp-2 flex-1 min-w-0">
        {message}
      </p>
    </div>
  );
}

/** Shared across all NotificationBell instances so we only toast each notification once. */
const shownToastIdsGlobal = new Set<number>();

/** Poll for recent unread and show toasts; mark as read only when user clicks toast. */
function useNotificationToasts(authenticated: boolean) {
  const router = useRouter();
  const { data: recentPollData } = useRecentUnreadPoll(authenticated);
  const markRead = useMarkNotificationsRead();

  useEffect(() => {
    const items = recentPollData?.items ?? [];
    if (items.length === 0) return;
    const newItems = items.filter((item) => !shownToastIdsGlobal.has(item.id));
    if (newItems.length === 0) return;
    newItems.forEach((item) => shownToastIdsGlobal.add(item.id));
    newItems.forEach((item) => {
      const message = formatNotificationMessage(item);
      const link = getNotificationLink(item);
      const showGroupIcon = !!item.group_avatar_url;
      const avatarUrl = showGroupIcon
        ? item.group_avatar_url
        : (item.sender?.avatar_url ?? null);
      const name = showGroupIcon
        ? "Group"
        : (item.sender?.username ?? "Someone");
      const iconVariant = showGroupIcon || item.sender ? "primary" : "muted";
      const notificationId = item.id;
      toast(
        <NotificationToastContent
          message={message}
          avatarUrl={avatarUrl}
          name={name}
          variant={iconVariant}
        />,
        {
          position: "bottom-right",
          autoClose: 10000,
          icon: false,
          onClick: () => {
            markRead.mutate({ notification_ids: [notificationId] });
            if (link) router.push(link);
          },
          style: { cursor: "pointer" },
          className: "notification-toast",
        },
      );
    });
  }, [recentPollData?.items]);
}

export interface NotificationBellProps {
  authenticated: boolean;
  /** Optional class for the trigger button wrapper. */
  className?: string;
}

/**
 * Bell icon with unread badge and dropdown of notifications.
 * When authenticated: runs 3-min poll and shows toasts for new items; marks as read on click (toast or dropdown item).
 */
export function NotificationBell({
  authenticated,
  className,
}: NotificationBellProps) {
  useNotificationToasts(authenticated);

  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData } = useNotifications(
    1,
    10,
    false,
    undefined,
    authenticated,
  );
  const unreadCount = authenticated ? (unreadData?.unread_count ?? 0) : 0;
  const allItems = authenticated ? (notificationsData?.items ?? []) : [];
  const markRead = useMarkNotificationsRead();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!authenticated) {
    return (
      <Link
        href="/profile"
        className={`relative inline-flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors ${className ?? ""}`}
        aria-label="Notifications"
      >
        <FaBell className="h-5 w-5 text-gray-200 hover:text-primary-active cursor-pointer" />
      </Link>
    );
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`relative inline-flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors outline-none ${className ?? ""}`}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <FaBell className="h-5 w-5 text-gray-200 hover:text-primary-active cursor-pointer" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-primary">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-80 mr-2 mt-2 md:mr-7 overflow-hidden p-0 flex flex-col"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-2">
          <span className="text-sm font-semibold text-foreground">
            Notifications
          </span>
          <Link
            href="/profile/?tab=notifications"
            className="text-sm font-semibold text-primary-font hover:underline"
            onClick={() => setDropdownOpen(false)}
          >
            View all
          </Link>
        </div>
        <ScrollArea className="h-[min(70vh,320px)]">
          {allItems.length === 0 ? (
            <div className="flex items-center justify-center h-[min(70vh,320px)]">
              <p className="text-sm font-semibold text-muted-foreground">
                No notifications
              </p>
            </div>
          ) : (
            <div className="py-1">
              {allItems.map((item) => {
                const href = getNotificationLink(item);
                const showGroupIcon = !!item.group_avatar_url;
                const isRead = !!item.read_at;
                const content = (
                  <div
                    className={`px-3 py-2 flex gap-2 items-center hover:bg-muted/50 cursor-pointer`}
                  >
                    <UserIcon
                      avatarUrl={
                        showGroupIcon
                          ? item.group_avatar_url
                          : (item.sender?.avatar_url ?? null)
                      }
                      name={
                        showGroupIcon ? "Group" : (item.sender?.username ?? "?")
                      }
                      size="small"
                      variant={
                        showGroupIcon || item.sender ? "primary" : "muted"
                      }
                      className="!h-8 !w-8 ring-1 ring-border/50"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium line-clamp-2 ${isRead ? "text-muted-foreground/80" : "text-foreground"}`}
                      >
                        {formatNotificationMessage(item)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTimeAgo(item.created_at)}
                      </p>
                    </div>
                    {!isRead && (
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-font/80"
                        aria-hidden
                      />
                    )}
                  </div>
                );
                const markThisRead = () => {
                  if (!isRead) markRead.mutate({ notification_ids: [item.id] });
                  setDropdownOpen(false);
                };
                if (href) {
                  return (
                    <Link key={item.id} href={href} onClick={markThisRead}>
                      {content}
                    </Link>
                  );
                }
                return (
                  <div key={item.id} onClick={markThisRead} role="button">
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
