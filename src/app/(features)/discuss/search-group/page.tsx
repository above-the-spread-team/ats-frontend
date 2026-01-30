"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Search, Users, Lock, FileText } from "lucide-react";
import StatusIcon from "../_components/status-icon";
import {
  useAllGroups,
  useFollowGroup,
  useUnfollowGroup,
} from "@/services/fastapi/groups";
import { useCurrentUser } from "@/services/fastapi/oauth";
import Image from "next/image";
import GroupTagFilter from "../_components/group-tag-filter";

export default function SearchGroupPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [loadingGroupId, setLoadingGroupId] = useState<number | null>(null);
  const pageSize = 20;

  // Sort tag IDs for consistent query keys
  const sortedTagIds =
    selectedTagIds.length > 0
      ? [...selectedTagIds].sort((a, b) => a - b)
      : undefined;

  const { data: groupsData, isLoading } = useAllGroups(
    page,
    pageSize,
    sortedTagIds,
  );
  const { data: currentUser } = useCurrentUser();
  const followGroupMutation = useFollowGroup();
  const unfollowGroupMutation = useUnfollowGroup();
  const groups = groupsData?.items || [];

  // Reset to page 1 when search query or tag filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTagIds]);

  // Filter groups based on search query (client-side filtering on current page)
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase().trim();
    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  const handleFollowGroup = async (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent action if another group is currently loading
    if (loadingGroupId !== null) {
      return;
    }

    if (!currentUser) {
      router.push("/login");
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    const followerStatus = group?.follower_status as
      | "active"
      | "pending"
      | "banned"
      | null
      | undefined;

    // Banned users cannot follow or unfollow
    if (followerStatus === "banned") {
      return;
    }

    const isFollowing =
      followerStatus === "active" || followerStatus === "pending";

    // Set loading state for this specific group
    setLoadingGroupId(groupId);

    try {
      if (isFollowing) {
        // Unfollow the group
        await unfollowGroupMutation.mutateAsync(groupId);
      } else {
        // Follow the group
        await followGroupMutation.mutateAsync(groupId);
      }
    } catch (error) {
      console.error(
        `Failed to ${isFollowing ? "unfollow" : "follow"} group:`,
        error,
      );
      // Error is handled by mutation state
    } finally {
      // Clear loading state
      setLoadingGroupId(null);
    }
  };

  return (
    <>
      <div className="mb-2 pl-2">
        <h1 className="text-lg md:text-xl font-bold mb-2">Discover Groups</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Find and follow groups to discuss your favorite topics
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search groups by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 md:h-10"
          />
        </div>
      </div>

      {/* Tag Filter */}
      <GroupTagFilter
        selectedTagIds={selectedTagIds}
        onTagIdsChange={setSelectedTagIds}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Groups List */}
      {!isLoading && (
        <>
          {filteredGroups.length > 0 ? (
            <div className="grid  md:grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
              {filteredGroups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/discuss/group-posts/${group.id}`)
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Group Icon */}
                      {group.icon_url ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={group.icon_url}
                            alt={group.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                      )}

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {group.name}
                          </h3>
                          {group.is_private && (
                            <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.member_count}{" "}
                              {group.member_count === 1 ? "member" : "members"}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {group.post_count}{" "}
                              {group.post_count === 1 ? "post" : "posts"}
                            </span>
                          </div>{" "}
                          <StatusIcon
                            isOwner={
                              currentUser?.id === group.owner_id || false
                            }
                            followerStatus={
                              group.follower_status as
                                | "active"
                                | "pending"
                                | "banned"
                                | null
                                | undefined
                            }
                            onFollow={(e) =>
                              handleFollowGroup(
                                group.id,
                                e || ({} as React.MouseEvent),
                              )
                            }
                            onUnfollow={(e) =>
                              handleFollowGroup(
                                group.id,
                                e || ({} as React.MouseEvent),
                              )
                            }
                            isFollowing={
                              loadingGroupId === group.id &&
                              followGroupMutation.isPending
                            }
                            isUnfollowing={
                              loadingGroupId === group.id &&
                              unfollowGroupMutation.isPending
                            }
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery.trim()
                    ? "No groups found"
                    : "No groups available"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery.trim()
                    ? "Try adjusting your search query"
                    : "Check back later for new groups"}
                </p>
                {searchQuery.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Pagination */}
      {!isLoading && groupsData && groupsData.total_pages > 1 && (
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
                const totalPages = groupsData.total_pages;

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
                    return <PaginationEllipsis key={`ellipsis-${idx}`} />;
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
                    if (page < (groupsData?.total_pages || 1)) {
                      setPage(page + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={
                    page === (groupsData?.total_pages || 1)
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && groupsData && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {searchQuery.trim() || selectedTagIds.length > 0 ? (
            <>
              Showing {filteredGroups.length} of {groups.length} groups on this
              page
              {selectedTagIds.length > 0 && (
                <span>
                  {" "}
                  (filtered by {selectedTagIds.length} tag
                  {selectedTagIds.length !== 1 ? "s" : ""})
                </span>
              )}
            </>
          ) : (
            <>
              Page {groupsData.page} of {groupsData.total_pages} (
              {groupsData.total} total groups)
            </>
          )}
        </div>
      )}
    </>
  );
}
