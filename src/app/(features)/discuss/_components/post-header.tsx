"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
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
  MoreVertical,
  Edit,
  Trash2,
  MessageCircle,
  ThumbsUp,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import StatusIcon from "./status-icon";
import {
  useFollowGroup,
  useUnfollowGroup,
  useDeleteGroup,
} from "@/services/fastapi/groups";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { GroupResponse } from "@/type/fastapi/groups";
import ConfirmDialog from "@/components/common/popup";
import { Tag } from "@/components/common/tag";

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
  const [expandDescription, setExpandDescription] = useState(false);

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
      <Card className="mb-3 pr-2    hover:shadow-md transition-shadow">
        <CardContent className="p-3 pr-0 md:p-5 md:pr-4">
          <div className="flex flex-col items-between gap-3 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 w-full">
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
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex-1 flex items-start justify-between gap-1">
                  <h1 className="text-lg md:text-xl font-bold text-foreground">
                    {groupData.name}
                  </h1>
                </div>

                {groupData.description && (
                  <div>
                    <p
                      className={`text-sm md:text-base text-muted-foreground ${expandDescription ? "" : "line-clamp-2"}`}
                    >
                      {groupData.description}
                    </p>
                    {!expandDescription &&
                      groupData.description.length > 100 && (
                        <button
                          onClick={() => setExpandDescription(true)}
                          className="mt-1 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-0.5"
                        >
                          Read more
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                    {expandDescription &&
                      groupData.description.length > 100 && (
                        <button
                          onClick={() => setExpandDescription(false)}
                          className="mt-1 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                          Read less
                          <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Group Info */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Tags */}
              {groupData.tags && groupData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {groupData.tags.map((tag) => (
                    <Tag key={tag.id} name={tag.name} variant="small" />
                  ))}
                </div>
              )}
              {/* Group Status */}
              {/* Follow/Unfollow/Owner Button and Actions */}
              {currentUser?.id === groupData.owner_id ? (
                <div className="flex -mr-2 items-center gap-2">
                  <StatusIcon
                    isOwner={true}
                    size="sm"
                    className="cursor-default flex-1"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-xl"
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
                </div>
              ) : (
                <StatusIcon
                  isOwner={false}
                  followerStatus={followerStatus}
                  onFollow={async () => {
                    if (!currentUser) {
                      router.push("/login");
                      return;
                    }
                    try {
                      await followGroupMutation.mutateAsync(groupData.id);
                    } catch (error) {
                      console.error("Failed to follow group:", error);
                    }
                  }}
                  onUnfollow={async () => {
                    try {
                      await unfollowGroupMutation.mutateAsync(groupData.id);
                    } catch (error) {
                      console.error("Failed to unfollow group:", error);
                    }
                  }}
                  isFollowing={followGroupMutation.isPending}
                  isUnfollowing={unfollowGroupMutation.isPending}
                  size="sm"
                  className="cursor-default"
                />
              )}
              {/* Group Stats */}
              <div className="flex pr-1 items-center gap-3 md:gap-8 flex-wrap text-xs md:text-sm">
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
                      ? "text-primary-font bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="font-semibold text-foreground">
                    {groupData.member_count}
                  </span>
                  <span>
                    {groupData.member_count === 1 ? "follower" : "followers"}
                  </span>
                </button>
                {groupData.pending_count !== null &&
                  groupData.pending_count > 0 && (
                    <button
                      onClick={() => {
                        onShowFollowersChange(false);
                        onShowBannedChange(false);
                        onShowPendingChange(!showPending);
                        onPageChange(1);
                      }}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer rounded-full px-2 py-1 -mx-2 -my-1 ${
                        showPending && !showFollowers && !showBanned
                          ? "text-primary-font bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">
                        {groupData.pending_count}
                      </span>
                      <span>
                        {groupData.pending_count === 1 ? "pending" : "pending"}
                      </span>
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
                      ? "text-primary-font bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="font-semibold text-foreground">
                    {groupData.post_count}
                  </span>
                  <span>{groupData.post_count === 1 ? "post" : "posts"}</span>
                </button>
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 mt-2 border-t border-border">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Created{" "}
                    {new Date(groupData.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                </span>
                <div className="flex items-center pr-3 gap-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="font-semibold text-foreground">
                      {groupData.comment_count}
                    </span>
                    <span>
                      {groupData.comment_count === 1 ? "comment" : "comments"}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ThumbsUp className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="font-semibold text-foreground">
                      {groupData.total_likes}
                    </span>
                    <span>
                      {groupData.total_likes === 1 ? "like" : "likes"}
                    </span>
                  </span>
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
