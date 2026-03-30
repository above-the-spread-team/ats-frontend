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
import { MessageCircle, User, Lock } from "lucide-react";
import { usePosts } from "@/services/fastapi/posts";
import {
  useGroupPosts,
  useGroup,
  useUserGroups,
  useAllGroups,
} from "@/services/fastapi/groups";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { PostDateFilter, PostSortOption } from "@/type/fastapi/posts";
import CreatePost from "./create-post";
import PostCard, { mapPostResponse } from "./post-card";
import TagFilter from "./tag-filter";
import GroupFollower from "./group-follower";
import PostHeader from "./post-header";
import FixturePostHeader from "./fixture-post-header";
import { useScroll } from "../_contexts/scroll-context";

interface PostContentProps {
  groupId?: number | null; // null for all posts, number for specific group
  initialView?: "pending" | "followers" | "banned"; // open a specific tab directly (e.g. from notification link)
}

export default function PostContent({
  groupId = null,
  initialView,
}: PostContentProps) {
  const router = useRouter();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<PostDateFilter | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<PostSortOption | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [followersPage, setFollowersPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [bannedPage, setBannedPage] = useState(1);
  const [showFollowers, setShowFollowers] = useState(
    initialView === "followers",
  );
  const [showPending, setShowPending] = useState(initialView === "pending");
  const [showBanned, setShowBanned] = useState(initialView === "banned");
  const pageSize = 20;

  // Use group posts if groupId is provided, otherwise use all posts
  const isGroupMode = groupId !== null && groupId !== undefined;

  // Fetch group details
  const { data: groupData, isLoading: isLoadingGroup } = useGroup(groupId);

  // Fetch group posts with pagination
  const {
    data: groupPostsData,
    isLoading: isLoadingGroupPosts,
    error: groupPostsError,
    refetch: refetchGroupPosts,
  } = useGroupPosts(groupId || null, page, pageSize);

  // Fetch all posts with pagination
  const {
    data: postsData,
    isLoading: isLoadingAllPosts,
    error: allPostsError,
    refetch: refetchAllPosts,
  } = usePosts(
    page, // page
    pageSize, // pageSize
    undefined, // authorId
    null, // groupId (null for all posts)
    selectedTagIds.length > 0 ? selectedTagIds : undefined, // tagIds
    dateRange,
    sortBy,
  );

  // Use group posts if in group mode, otherwise use all posts
  const isLoading = isGroupMode ? isLoadingGroupPosts : isLoadingAllPosts;
  const error = isGroupMode ? groupPostsError : allPostsError;
  const refetch = isGroupMode ? refetchGroupPosts : refetchAllPosts;

  // Get current user
  const { data: currentUser } = useCurrentUser();

  // Get user's groups to check if following
  const { data: userGroupsData } = useUserGroups(1, 100);
  // Get all groups to check follower_status (needed for pending/banned status)
  const { data: allGroupsData } = useAllGroups(1, 100);

  // Get list of group IDs the user is following (active followers only)
  const userGroupIds = useMemo(
    () => new Set<number>(userGroupsData?.items.map((group) => group.id) || []),
    [userGroupsData],
  );

  // Get follower_status for current group (if in group mode)
  const followerStatus = useMemo(() => {
    if (!isGroupMode || !groupId || !allGroupsData) {
      return null;
    }
    const group = allGroupsData.items.find((g) => g.id === groupId);
    return group?.follower_status ?? null;
  }, [isGroupMode, groupId, allGroupsData]);

  // Map posts to frontend format
  const posts = useMemo(() => {
    if (isGroupMode) {
      // For group posts, use paginated response
      if (!groupPostsData?.items) return [];
      return groupPostsData.items.map(mapPostResponse);
    } else {
      // For all posts, use paginated response
      if (!postsData?.items) return [];
      return postsData.items.map(mapPostResponse);
    }
  }, [isGroupMode, groupPostsData, postsData]);

  // Get scroll function from context
  const { scrollToTop } = useScroll();

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTagIds, dateRange, sortBy]);

  // Scroll to top when page changes
  useEffect(() => {
    scrollToTop();
  }, [page, scrollToTop]);

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

  // Check if user can view posts in this group
  // According to GROUP-FEATURES.md: Private groups are only visible to owner, active followers, and ADMIN
  // Public groups: Visible to all
  // Banned users cannot view private group posts
  const canViewPosts = useMemo(() => {
    // For all posts (not in group mode), everyone can view
    if (!isGroupMode) {
      return true;
    }

    // If group data is not loaded yet, assume we can view (will check after loading)
    if (!groupData) {
      return true;
    }

    // Public groups: Everyone can view
    if (!groupData.is_private) {
      return true;
    }

    // Private groups: Only owner, active followers, and ADMIN can view
    // If not authenticated, cannot view
    if (!currentUser) {
      return false;
    }

    // Owner can always view (user groups only; fixture groups have no owner)
    if (groupData.owner_id != null && currentUser.id === groupData.owner_id) {
      return true;
    }

    // Banned users cannot view
    if (followerStatus === "banned") {
      return false;
    }

    // Active followers can view
    if (followerStatus === "active") {
      return true;
    }

    // Pending followers and non-followers cannot view private content
    return false;
  }, [isGroupMode, groupData, currentUser, followerStatus]);

  // Check if user can create posts in this group
  // According to GROUP-FEATURES.md: Users must have ACTIVE status to create posts
  // Exceptions: Group Owner and ADMIN can always post
  const canCreatePost = useMemo(() => {
    // For all posts (not in group mode), authenticated users can post
    if (!isGroupMode) {
      return !!currentUser;
    }

    // For group posts, user must be:
    // 1. Authenticated
    // 2. Fixture groups: any logged-in user (no membership)
    // 3. User groups: owner OR active follower
    if (!currentUser || !groupData) {
      return false;
    }

    if (groupData.group_type === "fixture") {
      return true;
    }

    // Owner can always post
    if (groupData.owner_id != null && currentUser.id === groupData.owner_id) {
      return true;
    }

    // Active follower can post (group is in userGroupsData)
    return userGroupIds.has(groupData.id);
  }, [isGroupMode, currentUser, groupData, userGroupIds]);

  return (
    <>
      {/* Group Header - Show when viewing a group */}
      {isGroupMode && (
        <>
          {isLoadingGroup ? (
            <PostHeader
              groupData={null}
              isLoading
              followerStatus={followerStatus}
              showFollowers={showFollowers}
              showPending={showPending}
              showBanned={showBanned}
              onShowFollowersChange={(show) => {
                setShowFollowers(show);
                if (show) {
                  setShowPending(false);
                  setShowBanned(false);
                }
              }}
              onShowPendingChange={(show) => {
                setShowPending(show);
                if (show) {
                  setShowFollowers(false);
                  setShowBanned(false);
                }
              }}
              onShowBannedChange={(show) => {
                setShowBanned(show);
                if (show) {
                  setShowFollowers(false);
                  setShowPending(false);
                }
              }}
              onPageChange={(page) => {
                setPage(page);
                setFollowersPage(1);
                setPendingPage(1);
                setBannedPage(1);
              }}
            />
          ) : groupData?.group_type === "fixture" ? (
            <FixturePostHeader groupData={groupData} isLoading={false} />
          ) : (
            <PostHeader
              groupData={groupData || null}
              isLoading={false}
              followerStatus={followerStatus}
              showFollowers={showFollowers}
              showPending={showPending}
              showBanned={showBanned}
              onShowFollowersChange={(show) => {
                setShowFollowers(show);
                if (show) {
                  setShowPending(false);
                  setShowBanned(false);
                }
              }}
              onShowPendingChange={(show) => {
                setShowPending(show);
                if (show) {
                  setShowFollowers(false);
                  setShowBanned(false);
                }
              }}
              onShowBannedChange={(show) => {
                setShowBanned(show);
                if (show) {
                  setShowFollowers(false);
                  setShowPending(false);
                }
              }}
              onPageChange={(page) => {
                setPage(page);
                setFollowersPage(1);
                setPendingPage(1);
                setBannedPage(1);
              }}
            />
          )}
        </>
      )}

      {/* Create Post Input - Only show when not viewing followers/pending/banned and user can create posts */}
      {!showFollowers && !showPending && !showBanned && canCreatePost && (
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
        </>
      )}

      {/* Tag Filter - Always visible for all-posts view (not group mode), regardless of auth */}
      {!isGroupMode && !showFollowers && !showPending && !showBanned && (
        <TagFilter
          selectedTagIds={selectedTagIds}
          onTagIdsChange={setSelectedTagIds}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      )}

      {/* Loading State - Only show if user can view posts */}
      {isLoading && canViewPosts && (
        <div className="space-y-3 w-[92%] md:w-full max-w-lg md:max-w-3xl md:mx-auto md:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="py-2 pl-3 pr-1">
              <CardHeader className="p-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-28 md:w-36" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="w-7 h-7 rounded-md mr-1" />
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-3 pr-2">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Skeleton className="h-7 w-14 rounded-md" />
                  <Skeleton className="h-7 w-14 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Permission Check - Show immediately if user cannot view private group posts */}
      {isGroupMode && groupData && !isLoadingGroup && !canViewPosts && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base font-semibold mb-2">Content is private</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {!currentUser
                ? "Please log in to view this group's posts."
                : followerStatus === "banned"
                  ? "You are banned from this group and cannot view its content."
                  : followerStatus === "pending"
                    ? "Your request to join this group is pending approval. Once approved, you'll be able to view and post content."
                    : "This group's posts are only visible to active members. Please follow the group to view content."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && canViewPosts && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-destructive mb-4" />
            <h3 className="text-base font-semibold mb-2">
              {error instanceof Error && error.message === "Content is private"
                ? "Content is private"
                : "Failed to load posts"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {error instanceof Error
                ? error.message === "Content is private"
                  ? "This group's posts are only visible to active members. Please follow the group to view content."
                  : error.message
                : "An error occurred"}
            </p>
            {error instanceof Error &&
              error.message !== "Content is private" && (
                <Button onClick={() => refetch()} variant="outline">
                  Try again
                </Button>
              )}
          </CardContent>
        </Card>
      )}

      {/* Posts List or Followers List */}
      {!isLoading && !error && canViewPosts && (
        <>
          {isGroupMode && (showPending || showFollowers || showBanned) ? (
            // Followers/Pending/Banned List with Navigation
            <GroupFollower
              groupId={groupId!}
              page={
                showPending
                  ? pendingPage
                  : showBanned
                    ? bannedPage
                    : followersPage
              }
              pageSize={pageSize}
              onPageChange={(newPage) => {
                if (showPending) {
                  setPendingPage(newPage);
                } else if (showBanned) {
                  setBannedPage(newPage);
                } else {
                  setFollowersPage(newPage);
                }
              }}
              viewType={
                showPending ? "pending" : showBanned ? "banned" : "followers"
              }
              groupOwnerId={groupData?.owner_id ?? undefined}
              onViewChange={(view) => {
                setShowFollowers(view === "followers");
                setShowPending(view === "pending");
                setShowBanned(view === "banned");
              }}
            />
          ) : (
            // Posts List
            <div className="space-y-3 md:space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  hideGroupInfo={isGroupMode}
                />
              ))}
            </div>
          )}

          {/* Pagination for posts (both group and all posts) */}
          {!showFollowers &&
            !showPending &&
            !showBanned &&
            ((isGroupMode && groupPostsData) || (!isGroupMode && postsData)) &&
            (() => {
              const totalPages = isGroupMode
                ? (groupPostsData?.total_pages ?? 0)
                : (postsData?.total_pages ?? 0);
              return totalPages > 0 && totalPages > 1;
            })() && (
              <div className="flex justify-center pb-4 pt-2">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) {
                            setPage(page - 1);
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
                      const totalPages = isGroupMode
                        ? groupPostsData!.total_pages
                        : postsData!.total_pages;

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
                      let lastNum = 0;
                      for (const p of pages) {
                        if (p === "ellipsis") {
                          if (
                            uniquePages.length === 0 ||
                            uniquePages[uniquePages.length - 1] !== "ellipsis"
                          ) {
                            uniquePages.push("ellipsis");
                          }
                        } else {
                          if (p > lastNum) {
                            uniquePages.push(p);
                            lastNum = p;
                          }
                        }
                      }

                      return uniquePages.map((p, idx) => {
                        if (p === "ellipsis") {
                          return (
                            <PaginationItem key={`ellipsis-${idx}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                              }}
                              isActive={p === page}
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
                          const totalPages = isGroupMode
                            ? groupPostsData?.total_pages || 1
                            : postsData?.total_pages || 1;
                          if (page < totalPages) {
                            setPage(page + 1);
                          }
                        }}
                        className={
                          page ===
                          (isGroupMode
                            ? groupPostsData?.total_pages || 1
                            : postsData?.total_pages || 1)
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
      )}

      {/* Empty State - only when user can view posts and not on followers/pending/banned tabs */}
      {!isLoading &&
        !error &&
        !showFollowers &&
        !showPending &&
        !showBanned &&
        posts.length === 0 &&
        (!isGroupMode || canViewPosts) && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">
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
