"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Trash2 } from "lucide-react";
import { IoChatbubbles } from "react-icons/io5";
import {
  useNotifications,
  useMarkNotificationsRead,
  useUnreadCount,
  useDeleteNotification,
} from "@/services/fastapi/notification";
import UserIcon from "@/components/common/user-icon";
import type { NotificationItem } from "@/type/fastapi/notification";
import {
  formatNotificationMessage,
  getNotificationLink,
} from "@/lib/notification";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatTimeAgo } from "@/app/(features)/discuss/_components/comment-item";
import { cn } from "@/lib/utils";
import { FixtureDualTeamIcon } from "@/components/common/fixture-dual-team-icon";

const PAGE_SIZE = 15;

function NotificationRow({
  item,
  onMarkRead,
  isMarkReadPending,
  onDelete,
  isDeletePending,
}: {
  item: NotificationItem;
  onMarkRead: (id: number) => void;
  isMarkReadPending?: boolean;
  onDelete: (id: number) => void;
  isDeletePending?: boolean;
}) {
  const link = getNotificationLink(item);
  const isPrediction = item.notification_type === "prediction_result";
  const isModeration = item.notification_type === "moderation_report";
  const meta = item.metadata;
  const showGroupIcon = !isModeration && !!item.group_avatar_url;

  const rowClassName = cn(
    "flex items-start gap-3 rounded-lg border p-3 transition-colors",
    item.read_at
      ? "border-border/50 bg-card hover:bg-muted/30 hover:border-primary/15"
      : "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
  );

  const leftContent = (
    <>
      <div className="flex-shrink-0">
        {isPrediction ? (
          <FixtureDualTeamIcon
            homeTeamLogo={
              meta && typeof meta.home_team_logo === "string"
                ? meta.home_team_logo
                : null
            }
            awayTeamLogo={
              meta && typeof meta.away_team_logo === "string"
                ? meta.away_team_logo
                : null
            }
            homeTeamName={
              meta && typeof meta.home_team === "string"
                ? meta.home_team
                : undefined
            }
            awayTeamName={
              meta && typeof meta.away_team === "string"
                ? meta.away_team
                : undefined
            }
            size="sm"
          />
        ) : isModeration ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <IoChatbubbles className="h-6 w-6 text-primary-font" />
          </div>
        ) : showGroupIcon ? (
          <UserIcon
            avatarUrl={item.group_avatar_url}
            name="Group"
            size="small"
            variant="primary"
            className="h-9 w-9"
          />
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
          {formatNotificationMessage(item)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatTimeAgo(item.created_at)}
        </p>
      </div>
    </>
  );

  return (
    <div className={rowClassName}>
      {link ? (
        <Link
          href={link}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label={formatNotificationMessage(item)}
        >
          {leftContent}
        </Link>
      ) : (
        leftContent
      )}

      <div className="flex flex-shrink-0 items-center gap-1">
        {!item.read_at && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.preventDefault();
              onMarkRead(item.id);
            }}
            disabled={isMarkReadPending}
            title="Mark as read"
            aria-label="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            onDelete(item.id);
          }}
          disabled={isDeletePending}
          title="Delete notification"
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Notification() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: unreadData } = useUnreadCount();
  const { data, isLoading } = useNotifications(page, PAGE_SIZE, unreadOnly);
  const markReadMutation = useMarkNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const unreadCount = unreadData?.unread_count ?? 0;

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ notification_ids: [id] });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary-font">
              {unreadCount} unread
            </span>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-3 py-2">
            <Switch
              checked={unreadOnly}
              onCheckedChange={(checked) => {
                setUnreadOnly(checked);
                setPage(1);
              }}
              aria-label="Unread only"
            />
            <span className="text-sm font-medium text-muted-foreground">
              Unread only
            </span>
          </div>
        </div>

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
        <Card className="border-border/50 bg-card shadow-sm">
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
              isMarkReadPending={markReadMutation.isPending}
              onDelete={handleDelete}
              isDeletePending={deleteMutation.isPending}
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
