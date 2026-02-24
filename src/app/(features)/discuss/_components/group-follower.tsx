"use client";

import { useState, useEffect } from "react";
import UserIcon from "@/components/common/user-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Users, Clock, Check, X, Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGroupFollowers,
  usePendingFollowers,
  useBannedUsers,
  useApprovePendingFollower,
  useRejectPendingFollower,
  useBanUser,
  useUnbanUser,
} from "@/services/fastapi/groups";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { cn } from "@/lib/utils";

interface GroupFollowerProps {
  groupId: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  viewType: "followers" | "pending" | "banned";
  groupOwnerId?: number; // Owner ID to check if current user can ban
  onViewChange?: (view: "followers" | "pending" | "banned") => void; // Callback when view changes via navigation
}

export default function GroupFollower({
  groupId,
  page,
  pageSize,
  onPageChange,
  viewType,
  groupOwnerId,
  onViewChange,
}: GroupFollowerProps) {
  const { data: currentUser } = useCurrentUser();
  const [activeView, setActiveView] = useState<
    "followers" | "pending" | "banned"
  >(viewType);

  const {
    data: groupFollowersData,
    isLoading: isLoadingGroupFollowers,
    error: groupFollowersError,
  } = useGroupFollowers(groupId, page, pageSize);

  const {
    data: pendingFollowersData,
    isLoading: isLoadingPendingFollowers,
    error: pendingFollowersError,
  } = usePendingFollowers(groupId, page, pageSize);

  const {
    data: bannedUsersData,
    isLoading: isLoadingBannedUsers,
    error: bannedUsersError,
  } = useBannedUsers(groupId, page, pageSize);

  // Use the appropriate data based on activeView
  const data =
    activeView === "pending"
      ? pendingFollowersData
      : activeView === "banned"
        ? bannedUsersData
        : groupFollowersData;
  const isLoading =
    activeView === "pending"
      ? isLoadingPendingFollowers
      : activeView === "banned"
        ? isLoadingBannedUsers
        : isLoadingGroupFollowers;
  const error =
    activeView === "pending"
      ? pendingFollowersError
      : activeView === "banned"
        ? bannedUsersError
        : groupFollowersError;

  // Mutations
  const approveMutation = useApprovePendingFollower();
  const rejectMutation = useRejectPendingFollower();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  // Track which follower and action is being processed
  const [processingAction, setProcessingAction] = useState<{
    userId: number;
    action: "approve" | "reject" | "ban" | "unban";
  } | null>(null);

  // Check if current user is owner/admin (can ban/unban users)
  const canBanUsers =
    currentUser && groupOwnerId && currentUser.id === groupOwnerId;

  // Update active view when viewType prop changes
  useEffect(() => {
    setActiveView(viewType);
  }, [viewType]);

  // Reset processing state when data changes (after successful mutation, item is removed)
  useEffect(() => {
    if (processingAction && data) {
      const userStillInList = data.items.some(
        (item) => item.id === processingAction.userId,
      );
      if (!userStillInList) {
        setProcessingAction(null);
      }
    }
  }, [data, processingAction]);

  if (isLoading) {
    return (
      <div className="space-y-3 md:space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          {activeView === "pending" ? (
            <Clock className="w-12 h-12 mx-auto text-destructive mb-4" />
          ) : activeView === "banned" ? (
            <Ban className="w-12 h-12 mx-auto text-destructive mb-4" />
          ) : (
            <Users className="w-12 h-12 mx-auto text-destructive mb-4" />
          )}
          <h3 className="text-lg font-semibold mb-2">
            Failed to load{" "}
            {activeView === "pending"
              ? "pending followers"
              : activeView === "banned"
                ? "banned users"
                : "followers"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 ">
          {/* Navigation Tabs */}
          <div className="flex gap-1 mb-4 md:mb-5 p-1 bg-muted rounded-lg">
            <button
              onClick={() => {
                setActiveView("followers");
                onPageChange(1);
                onViewChange?.("followers");
              }}
              className={cn(
                "flex-1 flex items-center  justify-center gap-1.5 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors",
                activeView === "followers"
                  ? "bg-background  text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span>Followers</span>
            </button>
            {canBanUsers && (
              <button
                onClick={() => {
                  setActiveView("pending");
                  onPageChange(1);
                  onViewChange?.("pending");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors",
                  activeView === "pending"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span>Pending</span>
              </button>
            )}
            {canBanUsers && (
              <button
                onClick={() => {
                  setActiveView("banned");
                  onPageChange(1);
                  onViewChange?.("banned");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors",
                  activeView === "banned"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Ban className="w-3 h-3 md:w-4 md:h-4" />
                <span>Banned</span>
              </button>
            )}
          </div>
          <div className="py-12 text-center">
            {activeView === "pending" ? (
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            ) : activeView === "banned" ? (
              <Ban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            ) : (
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            )}
            <p className="text-muted-foreground">
              {activeView === "pending"
                ? "No pending followers at this time."
                : activeView === "banned"
                  ? "No banned users at this time."
                  : "No followers in this group yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Navigation Tabs */}
          <div className="flex gap-1 mb-4 md:mb-5 p-1 bg-muted rounded-lg">
            <button
              onClick={() => {
                setActiveView("followers");
                onPageChange(1);
                onViewChange?.("followers");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors",
                activeView === "followers"
                  ? "bg-background text-primary-font shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span>Followers</span>
            </button>
            {canBanUsers && (
              <button
                onClick={() => {
                  setActiveView("pending");
                  onPageChange(1);
                  onViewChange?.("pending");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors",
                  activeView === "pending"
                    ? "bg-background text-primary-font shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span>Pending</span>
              </button>
            )}
            {canBanUsers && (
              <button
                onClick={() => {
                  setActiveView("banned");
                  onPageChange(1);
                  onViewChange?.("banned");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors",
                  activeView === "banned"
                    ? "bg-background text-primary-font shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Ban className="w-3 h-3 md:w-4 md:h-4" />
                <span>Banned</span>
              </button>
            )}
          </div>
          <div className="space-y-2 md:space-y-3">
            {data.items.map((follower) => (
              <div
                key={follower.id}
                className={cn(
                  "flex justify-between items-center gap-3 pb-3 md:pb-4 border-b border-border last:border-b-0 last:pb-0",
                  activeView === "pending" && "flex-col md:flex-row",
                )}
              >
                <div className="flex items-center justify-start  gap-3">
                  <UserIcon
                    avatarUrl={follower.avatar_url}
                    name={follower.username}
                    size="medium"
                    variant="primary"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {follower.username}
                    </p>
                  </div>
                </div>
                {activeView === "followers" && canBanUsers && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        setProcessingAction({
                          userId: follower.id,
                          action: "ban",
                        });
                        try {
                          await banMutation.mutateAsync({
                            groupId,
                            userId: follower.id,
                          });
                        } catch (error) {
                          console.error("Failed to ban user:", error);
                          setProcessingAction(null);
                        }
                      }}
                      disabled={processingAction !== null}
                      className="h-7 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {processingAction?.userId === follower.id &&
                      processingAction?.action === "ban" &&
                      banMutation.isPending ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Ban className="w-3 h-3 mr-1" />
                          Ban
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {activeView === "banned" && canBanUsers && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={async () => {
                        setProcessingAction({
                          userId: follower.id,
                          action: "unban",
                        });
                        try {
                          await unbanMutation.mutateAsync({
                            groupId,
                            userId: follower.id,
                          });
                        } catch (error) {
                          console.error("Failed to unban user:", error);
                          setProcessingAction(null);
                        }
                      }}
                      disabled={processingAction !== null}
                      className="h-7 px-3 text-xs"
                    >
                      {processingAction?.userId === follower.id &&
                      processingAction?.action === "unban" &&
                      unbanMutation.isPending ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Unban
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {activeView === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={async () => {
                        setProcessingAction({
                          userId: follower.id,
                          action: "approve",
                        });
                        try {
                          await approveMutation.mutateAsync({
                            groupId,
                            userId: follower.id,
                          });
                        } catch (error) {
                          console.error("Failed to approve follower:", error);
                          setProcessingAction(null);
                        }
                      }}
                      disabled={processingAction !== null}
                      className="h-7 px-3 text-xs"
                    >
                      {processingAction?.userId === follower.id &&
                      processingAction?.action === "approve" &&
                      approveMutation.isPending ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        setProcessingAction({
                          userId: follower.id,
                          action: "reject",
                        });
                        try {
                          await rejectMutation.mutateAsync({
                            groupId,
                            userId: follower.id,
                          });
                        } catch (error) {
                          console.error("Failed to reject follower:", error);
                          setProcessingAction(null);
                        }
                      }}
                      disabled={processingAction !== null}
                      className="h-7 px-3 text-xs"
                    >
                      {processingAction?.userId === follower.id &&
                      processingAction?.action === "reject" &&
                      rejectMutation.isPending ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination for followers */}
      {data.total_pages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) {
                      onPageChange(page - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Generate page numbers */}
              {(() => {
                const pages: (number | "ellipsis")[] = [];
                const totalPages = data.total_pages;

                if (totalPages > 0) {
                  pages.push(1);
                }

                if (page > 3) {
                  pages.push("ellipsis");
                }

                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);

                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                  }
                }

                if (page < totalPages - 2) {
                  pages.push("ellipsis");
                }

                if (totalPages > 1) {
                  pages.push(totalPages);
                }

                const uniquePages: (number | "ellipsis")[] = [];
                const seen = new Set<number | "ellipsis">();
                for (const p of pages) {
                  if (!seen.has(p)) {
                    uniquePages.push(p);
                    seen.add(p);
                  }
                }

                return uniquePages.map((p, idx) => {
                  if (p === "ellipsis") {
                    return <PaginationEllipsis key={`ellipsis-${idx}`} />;
                  }
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        isActive={page === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                });
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < (data?.total_pages || 1)) {
                      onPageChange(page + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={
                    page === (data?.total_pages || 1)
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
