"use client";

import Link from "next/link";
import { usePosts } from "@/services/fastapi/posts";
import { Skeleton } from "@/components/ui/skeleton";
import UserIcon from "@/components/common/user-icon";
import { mapPostResponse } from "@/app/(features)/discuss/_components/post-card";

export default function HomeDiscuss() {
  const { data: postsData, isLoading, error } = usePosts(1, 11);

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="divide-y divide-border">
            {Array.from({ length: 11 }).map((_, idx) => (
              <div key={idx} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !postsData || postsData.items.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold">Latest Discussions</h2>
          <Link
            href="/discuss"
            className="text-sm text-primary hover:underline font-semibold"
          >
            View All →
          </Link>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {error ? "Failed to load posts" : "No posts available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const posts = postsData.items.map(mapPostResponse);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold">Latest Discussions</h2>
        <Link
          href="/discuss"
          className="text-sm text-primary hover:underline font-semibold"
        >
          View All →
        </Link>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <Link key={post.id} href={`/discuss/${post.id}`} className="block">
              <div className="flex items-center gap-2  px-4 py-3 hover:bg-muted/40  transition-all duration-200 group border-l-4 border-primary-font/30 hover:border-primary">
                <div className="flex-shrink-0">
                  <UserIcon
                    avatarUrl={post.author.avatar}
                    name={post.author.name}
                    size="small"
                    variant="primary"
                  />
                </div>
                <p className="text-sm text-foreground line-clamp-1 flex-1 min-w-0 group-hover:text-primary-font transition-colors font-medium">
                  {post.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
