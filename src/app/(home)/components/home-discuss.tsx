"use client";

import { mockDiscussions, type DiscussionPost } from "@/data/discuss-mock";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, ThumbsUp, Eye, Pin, Flame } from "lucide-react";

export default function HomeDiscuss() {
  // Get top 5 discussions (prioritize pinned and hot)
  const topDiscussions = mockDiscussions
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isHot && !b.isHot) return -1;
      if (!a.isHot && b.isHot) return 1;
      return b.likes + b.replies - (a.likes + a.replies);
    })
    .slice(0, 5);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold">Hot Discussions</h2>
        <Link
          href="/discuss"
          className="text-sm text-primary hover:underline font-semibold"
        >
          View All →
        </Link>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {topDiscussions.map((post, index) => (
            <Link
              key={post.id}
              href={`/discuss#${post.id}`}
              className="block p-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Author Avatar */}
                <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full overflow-hidden bg-muted">
                  {post.author.avatar && (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 32px, 40px"
                    />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.isPinned && (
                      <Pin className="w-3 h-3 text-primary flex-shrink-0" />
                    )}
                    {post.isHot && (
                      <Flame className="w-3 h-3 text-orange-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-foreground truncate">
                      {post.author.name}
                    </span>
                    {post.author.badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {post.author.badge}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(post.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.replies}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.views}</span>
                    </div>
                    {post.lastReply && (
                      <span className="ml-auto text-xs">
                        Last: {post.lastReply.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
