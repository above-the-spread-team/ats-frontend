"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationsRead,
  useUnreadCount,
} from "@/services/fastapi/notification";
import UserIcon from "@/components/common/user-icon";
import type { NotificationItem } from "@/type/fastapi/notification";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatTimeAgo } from "@/app/(features)/discuss/_components/comment-item";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

function formatMessage(item: NotificationItem): string {
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

function getLink(item: NotificationItem): string | null {
  const meta = item.metadata;
  if (!meta) return null;
  if (typeof meta.post_id === "number") return `/discuss/${meta.post_id}`;
  if (typeof meta.group_id === "number")
    return `/discuss/group-posts/${meta.group_id}`;
  return null;
}

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: NotificationItem;
  onMarkRead: (id: number) => void;
}) {
  const link = getLink(item);
  const showGroupIcon = !!item.group_avatar_url;
  const content = (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3 transition-colors",
        item.read_at
          ? "border-border/50 bg-card"
          : "border-primary/20 bg-primary/5",
      )}
    >
      <div className="flex-shrink-0">
        {showGroupIcon ? (
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-border/50">
            <Image
              src={item.group_avatar_url!}
              alt="Group"
              width={36}
              height={36}
              className="h-9 w-9 object-cover"
            />
          </div>
        ) : item.sender ? (
          <UserIcon
            avatarUrl={item.sender.avatar_url}
            name={item.sender.username}
            size="small"
            variant="primary"
            className="h-9 w-9"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {formatMessage(item)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatTimeAgo(item.created_at)}
        </p>
      </div>
      {!item.read_at && (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={(e) => {
            e.preventDefault();
            onMarkRead(item.id);
          }}
          title="Mark as read"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

export default function Notification() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: unreadData } = useUnreadCount();
  const { data, isLoading } = useNotifications(page, PAGE_SIZE, unreadOnly);
  const markReadMutation = useMarkNotificationsRead();

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const unreadCount = unreadData?.unread_count ?? 0;

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ notification_ids: [id] });
  };

  const handleMarkAllRead = () => {
    const unreadIds = items.filter((i) => !i.read_at).map((i) => i.id);
    if (unreadIds.length > 0) {
      markReadMutation.mutate({ notification_ids: unreadIds });
    }
  };

  const hasUnreadOnPage = items.some((i) => !i.read_at);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {unreadCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {unreadCount} unread
          </span>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-border"
          />
          Unread only
        </label>
        {hasUnreadOnPage && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markReadMutation.isPending}
          >
            <Check className="mr-1.5 h-4 w-4" />
            Mark page as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-muted-foreground">
              {unreadOnly ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-sm text-muted-foreground/80">
              Likes, comments, and group updates will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onMarkRead={handleMarkRead}
            />
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage((p) => p - 1);
                      }}
                      className={
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-2 text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage((p) => p + 1);
                      }}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
