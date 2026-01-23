"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullPage from "@/components/common/full-page";
import UserIcon from "@/components/common/user-icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, User } from "lucide-react";
import { useInfinitePosts } from "@/services/fastapi/posts";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { PostDateFilter, PostSortOption } from "@/type/fastapi/posts";
import CreatePost from "./_components/create-post";
import PostCard, { mapPostResponse } from "./_components/post-card";
import TagFilter from "./_components/tag-filter";

export default function DiscussPage() {
  const router = useRouter();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<PostDateFilter | undefined>(
    undefined
  );
  const [sortBy, setSortBy] = useState<PostSortOption | undefined>(undefined);

  // Fetch posts from API with infinite scrolling
  const {
    data: postsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePosts(
    undefined,
    selectedTagIds.length > 0 ? selectedTagIds : undefined,
    dateRange,
    sortBy
  );

  // Get current user
  const { data: currentUser } = useCurrentUser();

  // Flatten all pages into a single array and map to frontend format
  const posts = useMemo(() => {
    if (!postsData?.pages) return [];
    const allPosts = postsData.pages.flatMap((page) => page.items);
    return allPosts.map(mapPostResponse);
  }, [postsData]);

  // Scroll detection for infinite loading
  useEffect(() => {
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        {/* Create Post Input */}
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
        />

        {/* Tag Filter */}
        <TagFilter
          selectedTagIds={selectedTagIds}
          onTagIdsChange={setSelectedTagIds}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

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

        {/* Posts List */}
        {!isLoading && !error && (
          <>
            <div className="space-y-3 md:space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {/* Loading indicator for fetching more */}
            {isFetchingNextPage && (
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
        {!isLoading && !error && posts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {selectedTagIds.length > 0 || dateRange || sortBy
                  ? "No posts found with the selected filters."
                  : "No posts yet. Be the first to share!"}
              </p>
              {(selectedTagIds.length > 0 || dateRange || sortBy) && (
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
