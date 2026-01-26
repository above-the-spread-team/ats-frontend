"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Lock,
  UserPlus,
  Check,
  Crown,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Ban,
  MessageCircle,
  ThumbsUp,
  FileText,
  Calendar,
} from "lucide-react";
import { useFollowGroup, useUnfollowGroup, useDeleteGroup } from "@/services/fastapi/groups";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { GroupResponse } from "@/type/fastapi/groups";
import ConfirmDialog from "@/components/common/popup";

interface PostHeaderProps {
  groupData: GroupResponse | null;
  isLoading: boolean;
  followerStatus: "active" | "pending" | "banned" | null | undefined;
  showFollowers: boolean;
  showPending: boolean;
  showBanned: boolean;
  onShowFollowersChange: (show: boolean) => void;
  onShowPendingChange: (show: boolean) => void;
  onShowBannedChange: (show: boolean) => void;
  onPageChange: (page: number) => void;
}

export default function PostHeader({
  groupData,
  isLoading,
  followerStatus,
  showFollowers,
  showPending,
  showBanned,
  onShowFollowersChange,
  onShowPendingChange,
  onShowBannedChange,
  onPageChange,
}: PostHeaderProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const followGroupMutation = useFollowGroup();
  const unfollowGroupMutation = useUnfollowGroup();
  const deleteGroupMutation = useDeleteGroup();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Don't render if no group data
  if (!groupData && !isLoading) {
    return null;
  }

  // Loading State
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 md:h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!groupData) {
    return null;
  }

  return (
    <>
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4 justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Group Icon */}
              {groupData.icon_url ? (
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={groupData.icon_url}
                    alt={groupData.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 64px, 80px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
              )}

              {/* Group Info */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                    {groupData.name}
                  </h1>

                  {/* Follow/Unfollow/Owner Button and Actions */}
                  {currentUser && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {currentUser.id === groupData.owner_id ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-default"
                            disabled
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            Owner
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  router.push(`/discuss/edit-group/${groupData.id}`);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Group
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Group
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      ) : followerStatus === "banned" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-default"
                          disabled
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Banned
                        </Button>
                      ) : followerStatus === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-default"
                          disabled
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </Button>
                      ) : followerStatus === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await unfollowGroupMutation.mutateAsync(groupData.id);
                            } catch (error) {
                              console.error("Failed to unfollow group:", error);
                            }
                          }}
                          disabled={unfollowGroupMutation.isPending || followGroupMutation.isPending}
                        >
                          {unfollowGroupMutation.isPending ? (
                            <>
                              <span className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Unfollowing...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Following
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={async () => {
                            try {
                              await followGroupMutation.mutateAsync(groupData.id);
                            } catch (error) {
                              console.error("Failed to follow group:", error);
                            }
                          }}
                          disabled={followGroupMutation.isPending || unfollowGroupMutation.isPending}
                        >
                          {followGroupMutation.isPending ? (
                            <>
                              <span className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Following...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Follow
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {groupData.description && (
                  <p className="text-sm md:text-base text-muted-foreground mb-3">
                    {groupData.description}
                  </p>
                )}
                {/* Group Stats */}
                <div className="flex pr-1 items-center gap-4 md:gap-8 flex-wrap text-xs md:text-sm">
                  {groupData.is_private && (
                    <>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span>Private</span>
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => {
                      onShowPendingChange(false);
                      onShowBannedChange(false);
                      onShowFollowersChange(!showFollowers);
                      onPageChange(1);
                    }}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer rounded-full px-2 py-1 -mx-2 -my-1 ${
                      showFollowers && !showPending && !showBanned
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="font-semibold text-foreground">{groupData.member_count}</span>
                    <span>{groupData.member_count === 1 ? "follower" : "followers"}</span>
                  </button>
                  {groupData.pending_count !== null && groupData.pending_count > 0 && (
                    <button
                      onClick={() => {
                        onShowFollowersChange(false);
                        onShowBannedChange(false);
                        onShowPendingChange(!showPending);
                        onPageChange(1);
                      }}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer rounded-full px-2 py-1 -mx-2 -my-1 ${
                        showPending && !showFollowers && !showBanned
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{groupData.pending_count}</span>
                      <span>{groupData.pending_count === 1 ? "pending" : "pending"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onShowFollowersChange(false);
                      onShowPendingChange(false);
                      onShowBannedChange(false);
                      onPageChange(1);
                    }}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer rounded-full px-2 py-1 -mx-2 -my-1 ${
                      !showFollowers && !showPending && !showBanned
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="font-semibold text-foreground">{groupData.post_count}</span>
                    <span>{groupData.post_count === 1 ? "post" : "posts"}</span>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 mt-2 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Created {new Date(groupData.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{groupData.comment_count}</span>
                      <span>{groupData.comment_count === 1 ? "comment" : "comments"}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <ThumbsUp className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{groupData.total_likes}</span>
                      <span>{groupData.total_likes === 1 ? "like" : "likes"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Group Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Group"
        description={`Are you sure you want to delete "${groupData.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          try {
            await deleteGroupMutation.mutateAsync(groupData.id);
            // Redirect to all posts after deletion
            router.push("/discuss");
          } catch (error) {
            console.error("Failed to delete group:", error);
          }
        }}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isPending={deleteGroupMutation.isPending}
      />
    </>
  );
}
