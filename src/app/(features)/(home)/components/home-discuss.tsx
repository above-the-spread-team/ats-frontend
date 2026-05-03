"use client";

import Link from "next/link";
import { usePosts } from "@/services/fastapi/posts";
import { Skeleton } from "@/components/ui/skeleton";
import UserIcon from "@/components/common/user-icon";
import { mapPostResponse } from "@/app/(features)/discuss/_components/post-card";
import HomeFailToLoad from "./home-fail-to-load";

export default function HomeDiscuss() {
  const { data: postsData, isLoading, error } = usePosts(1, 12);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="px-2 mb-2">
          <Skeleton className="h-7 w-44" />
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, idx) => (
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

  if (error) {
    return (
      <div className="w-full">
        <Link
          href="/discuss"
          className="text-sm block mb-2 px-2 text-primary-font hover:underline font-semibold"
        >
          <h2 className="text-lg md:text-xl font-bold">Latest Discussions</h2>
        </Link>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <HomeFailToLoad message="Failed to load discussions" />
        </div>
      </div>
    );
  }

  if (!postsData || postsData.items.length === 0) {
    return (
      <div className="w-full">
        <Link
          href="/discuss"
          className="text-sm block mb-2 px-2 text-primary-font hover:underline font-semibold"
        >
          <h2 className="text-lg md:text-xl font-bold">Latest Discussions</h2>
        </Link>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No posts available</p>
          </div>
        </div>
      </div>
    );
  }

  const posts = postsData.items.map(mapPostResponse);

  return (
    <div className="w-full">
      <Link
        href="/discuss"
        className="text-sm px-2 block mb-2 text-primary-font hover:underline font-semibold"
      >
        <h2 className="text-lg md:text-xl font-bold">Latest Discussions</h2>
      </Link>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <Link key={post.id} href={`/discuss/${post.id}`} className="block">
              <div className="flex items-center gap-2  px-4 py-3 hover:bg-muted/40  transition-all duration-200 group border-l-4 border-primary-font/30 hover:border-primary-font">
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
