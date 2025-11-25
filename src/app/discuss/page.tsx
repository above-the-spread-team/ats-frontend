import Image from "next/image";
import { mockDiscussions } from "@/data/discuss-mock";
import { MessageSquare, Eye, ThumbsUp, TrendingUp, Pin } from "lucide-react";

export default function Discuss() {
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Premier League": "bg-purple-500",
      "La Liga": "bg-orange-500",
      "Serie A": "bg-blue-500",
      "Champions League": "bg-indigo-600",
      "General Discussion": "bg-green-500",
      "Transfer Talk": "bg-yellow-600",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen container mx-auto max-w-6xl bg-background p-2 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6 px-1 md:px-0">
        <button className="bg-primary text-white px-2.5 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-base font-semibold hover:bg-primary-active transition-colors flex-shrink-0">
          + New
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-1.5 md:gap-4 mb-3 md:mb-6">
        <div className="bg-card border border-border rounded-lg p-1.5 md:p-4">
          <div className="text-base md:text-3xl font-bold text-primary">
            {mockDiscussions.length}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Topics</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-1.5 md:p-4">
          <div className="text-base md:text-3xl font-bold text-green-500">
            {mockDiscussions.reduce((sum, d) => sum + d.replies, 0)}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">
            Replies
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-1.5 md:p-4">
          <div className="text-base md:text-3xl font-bold text-blue-500">
            {mockDiscussions.reduce((sum, d) => sum + d.views, 0)}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Views</div>
        </div>
      </div>

      {/* Discussion List */}
      <div className="space-y-2 md:space-y-3">
        {mockDiscussions.map((post) => (
          <div
            key={post.id}
            className={`bg-card border border-border rounded-lg p-2.5 md:p-4 hover:shadow-md transition-shadow cursor-pointer ${
              post.isPinned ? "border-primary" : ""
            }`}
          >
            {/* Mobile Layout */}
            <div className="md:hidden space-y-1.5">
              {/* Header */}
              <div className="flex items-start gap-2">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {post.isPinned && (
                      <Pin className="w-3 h-3 text-primary flex-shrink-0" />
                    )}
                    {post.isHot && (
                      <TrendingUp className="w-3 h-3 text-orange-500 flex-shrink-0" />
                    )}
                    <span
                      className={`${getCategoryColor(
                        post.category
                      )} text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 truncate max-w-[100px]`}
                    >
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs mb-0.5 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-0.5">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-xs">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-xs">{post.replies}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">{post.views}</span>
                  </div>
                </div>
                <span className="text-xs flex-shrink-0">
                  {formatTime(post.createdAt)}
                </span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-start gap-4">
              {/* Avatar */}
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {post.isPinned && (
                    <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  {post.isHot && (
                    <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                  <span
                    className={`${getCategoryColor(
                      post.category
                    )} text-white text-xs px-2 py-1 rounded-full`}
                  >
                    {post.category}
                  </span>
                  {post.author.badge && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {post.author.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold">{post.author.name}</span>
                    <span>•</span>
                    <span>{formatTime(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.replies}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
                {post.lastReply && (
                  <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    Last reply by{" "}
                    <span className="font-semibold">
                      {post.lastReply.author}
                    </span>{" "}
                    {post.lastReply.time}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
