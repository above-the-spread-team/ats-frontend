"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useUserPosts } from "@/services/fastapi/posts";
import PostCard, { mapPostResponse } from "@/app/(features)/discuss/_components/post-card";

const PAGE_SIZE = 10;

export interface UserPostsProps {
  userId: number;
}

export default function UserPosts({ userId }: UserPostsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserPosts(userId, page, PAGE_SIZE);

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No posts yet</p>
          <p className="text-sm text-muted-foreground/80 mb-4">
            Your posts from the discuss section will appear here.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/discuss">Go to Discuss</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((post) => (
          <PostCard
            key={post.id}
            post={mapPostResponse(post)}
            hideGroupInfo={false}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
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
  );
}
