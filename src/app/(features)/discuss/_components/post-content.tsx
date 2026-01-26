"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserIcon from "@/components/common/user-icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { MessageCircle, User, Users, Lock, UserPlus, Check, Crown, MoreVertical, Edit, Trash2, ThumbsUp, ThumbsDown, FileText, Calendar, Dot } from "lucide-react";
import { Tag } from "@/components/common/tag";
import { useInfinitePosts } from "@/services/fastapi/posts";
import { useGroupPosts, useGroup, useFollowGroup, useUnfollowGroup, useUserGroups, useDeleteGroup } from "@/services/fastapi/groups";
import { useCurrentUser } from "@/services/fastapi/oauth";
import Image from "next/image";
import type { PostDateFilter, PostSortOption } from "@/type/fastapi/posts";
import CreatePost from "./create-post";
import PostCard, { mapPostResponse } from "./post-card";
import TagFilter from "./tag-filter";
import GroupMember from "./group-member";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/common/popup";

interface PostContentProps {
  groupId?: number | null; // null for all posts, number for specific group
}

export default function PostContent({ groupId = null }: PostContentProps) {
  const router = useRouter();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<PostDateFilter | undefined>(
    undefined
  );
  const [sortBy, setSortBy] = useState<PostSortOption | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [membersPage, setMembersPage] = useState(1);
  const [showMembers, setShowMembers] = useState(false);
  const pageSize = 20;

  // Use group posts if groupId is provided, otherwise use all posts
  const isGroupMode = groupId !== null && groupId !== undefined;

  // Fetch group details
  const {
    data: groupData,
    isLoading: isLoadingGroup,
  } = useGroup(groupId);

  // Fetch group posts with pagination
  const {
    data: groupPostsData,
    isLoading: isLoadingGroupPosts,
    error: groupPostsError,
    refetch: refetchGroupPosts,
  } = useGroupPosts(groupId || null, page, pageSize);


  // Fetch all posts with infinite scrolling
  const {
    data: postsData,
    isLoading: isLoadingAllPosts,
    error: allPostsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchAllPosts,
  } = useInfinitePosts(
    undefined, // authorId
    null, // groupId (null for all posts)
    selectedTagIds.length > 0 ? selectedTagIds : undefined, // tagIds
    dateRange,
    sortBy
  );

  // Use group posts if in group mode, otherwise use all posts
  const isLoading = isGroupMode ? isLoadingGroupPosts : isLoadingAllPosts;
  const error = isGroupMode ? groupPostsError : allPostsError;
  const refetch = isGroupMode ? refetchGroupPosts : refetchAllPosts;

  // Get current user
  const { data: currentUser } = useCurrentUser();
  
  // Get user's groups to check if following
  const { data: userGroupsData } = useUserGroups(1, 100);
  const followGroupMutation = useFollowGroup();
  const unfollowGroupMutation = useUnfollowGroup();
  const deleteGroupMutation = useDeleteGroup();
  
  // Get list of group IDs the user is following
  const userGroupIds = new Set<number>(
    userGroupsData?.items.map((group) => group.id) || []
  );

  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Map posts to frontend format
  const posts = useMemo(() => {
    if (isGroupMode) {
      // For group posts, use paginated response
      if (!groupPostsData?.items) return [];
      return groupPostsData.items.map(mapPostResponse);
    } else {
      // For all posts, flatten infinite query pages
      if (!postsData?.pages) return [];
      const allPosts = postsData.pages.flatMap((page) => page.items);
      return allPosts.map(mapPostResponse);
    }
  }, [isGroupMode, groupPostsData, postsData]);

  // Reset page to 1 when filters change (only for all posts)
  useEffect(() => {
    if (!isGroupMode) {
      setPage(1);
    }
  }, [selectedTagIds, dateRange, sortBy, isGroupMode]);

  // Scroll detection for infinite loading (only for all posts, not group posts)
  useEffect(() => {
    if (isGroupMode) return; // Don't use infinite scroll for group posts

    const handleScroll = () => {
      // Check if user is near the bottom of the page
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is 200px from the bottom
      if (
        scrollTop + windowHeight >= documentHeight - 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isGroupMode, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle create post input click
  const handleCreatePostClick = () => {
    if (currentUser) {
      setIsCreatePostOpen(true);
    } else {
      router.push("/login");
    }
  };

  // Scroll to post when hash is present in URL (e.g., when returning from single post view)
  useEffect(() => {
    if (!posts.length) return; // Wait for posts to load

    const scrollToPost = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove the '#'
        const element = document.getElementById(hash);
        if (element) {
          // Small delay to ensure the page has rendered
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            // Clear the hash after scrolling
            window.history.replaceState(null, "", window.location.pathname);
          }, 100);
        }
      }
    };

    scrollToPost();
  }, [posts]); // Run when posts are loaded

  return (
    <>
      {/* Group Header - Show when viewing a group */}
      {isGroupMode && groupData && (
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
                              // Navigate to edit group page
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
                  ) : userGroupIds.has(groupData.id) ? (
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
                        setShowMembers(!showMembers);
                        setMembersPage(1);
                      }}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer rounded-full px-2 py-1 -mx-2 -my-1 ${
                        showMembers
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{groupData.member_count}</span>
                      <span>{groupData.member_count === 1 ? "member" : "members"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMembers(false);
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer rounded-full px-2 py-1 -mx-2 -my-1 ${
                        !showMembers
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
      )}

      {/* Delete Group Confirmation Dialog */}
      {isGroupMode && groupData && (
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
      )}

      {/* Group Header Loading State */}
      {isGroupMode && isLoadingGroup && (
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
      )}

      {/* Create Post Input - Only show when not viewing members */}
      {!showMembers && (
        <>
          <Card className="mb-3 hover:shadow-md rounded-3xl transition-shadow">
            <CardContent className="p-2 px-3 md:p-3 md:px-4">
              <div className="flex items-center gap-3">
                {currentUser ? (
                  <UserIcon
                    avatarUrl={currentUser.avatar_url}
                    name={currentUser.username}
                    size="medium"
                    variant="primary"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mygray flex items-center justify-center text-muted-foreground flex-shrink-0 overflow-hidden">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-background font-black" />
                  </div>
                )}
                <div
                  onClick={handleCreatePostClick}
                  className="flex-1 rounded-full bg-mygray/20 hover:bg-muted border border-border  px-4 py-2 md:py-3 cursor-pointer transition-colors"
                >
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Want to say something?
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Post Dialog */}
          <CreatePost
            open={isCreatePostOpen}
            onOpenChange={setIsCreatePostOpen}
            groupId={groupId || undefined}
          />

          {/* Tag Filter - Only show for all posts, not group posts */}
          {!isGroupMode && (
            <TagFilter
              selectedTagIds={selectedTagIds}
              onTagIdsChange={setSelectedTagIds}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3 md:space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 px-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-6 pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load posts
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Posts List or Members List */}
      {!isLoading && !error && (
        <>
          {isGroupMode && showMembers ? (
            // Members List
            <GroupMember
              groupId={groupId!}
              page={membersPage}
              pageSize={pageSize}
              onPageChange={setMembersPage}
            />
          ) : (
            // Posts List
            <div className="space-y-3 md:space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {/* Pagination for group posts */}
          {isGroupMode && !showMembers && groupPostsData && groupPostsData.total_pages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) {
                          setPage(page - 1);
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
                    const totalPages = groupPostsData.total_pages;

                    // Always show first page
                    if (totalPages > 0) {
                      pages.push(1);
                    }

                    // Show ellipsis if current page is far from start
                    if (page > 3) {
                      pages.push("ellipsis");
                    }

                    // Show pages around current page
                    const start = Math.max(2, page - 1);
                    const end = Math.min(totalPages - 1, page + 1);

                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(i);
                      }
                    }

                    // Show ellipsis if current page is far from end
                    if (page < totalPages - 2) {
                      pages.push("ellipsis");
                    }

                    // Always show last page (if more than 1 page)
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }

                    // Remove duplicates and sort
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
                        return (
                          <PaginationEllipsis key={`ellipsis-${idx}`} />
                        );
                      }
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
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
                        if (page < (groupPostsData?.total_pages || 1)) {
                          setPage(page + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className={
                        page === (groupPostsData?.total_pages || 1)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Loading indicator for fetching more (only for all posts infinite scroll) */}
          {!isGroupMode && isFetchingNextPage && (
            <div className="space-y-3 md:space-y-4 mt-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-6 pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && !showMembers && posts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {isGroupMode
                ? "No posts in this group yet. Be the first to share!"
                : selectedTagIds.length > 0 || dateRange || sortBy
                ? "No posts found with the selected filters."
                : "No posts yet. Be the first to share!"}
            </p>
            {!isGroupMode &&
              (selectedTagIds.length > 0 || dateRange || sortBy) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTagIds([]);
                    setDateRange(undefined);
                    setSortBy(undefined);
                  }}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
