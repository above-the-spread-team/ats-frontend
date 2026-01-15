"use client";

import Link from "next/link";
import { useNews } from "@/services/fastapi/news";
import type { NewsResponse } from "@/type/fastapi/news";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/common/tag";

export default function HomeNews() {
  const { data: newsData, isLoading, error } = useNews(1, 8);

  const formatDate = (dateString: string) => {
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

  const getFirstTag = (news: NewsResponse) => {
    return news.tags && news.tags.length > 0 ? news.tags[0].name : "News";
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Link
          href="/news"
          className="text-sm px-2 block mb-2 text-primary-font hover:underline font-semibold"
        >
          <h2 className="text-lg md:text-xl font-bold">Latest News</h2>
        </Link>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-3">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
          href="/news"
          className="text-sm px-2 block mb-2 text-primary-font hover:underline font-semibold"
        >
          <h2 className="text-lg md:text-xl font-bold">Latest News</h2>
        </Link>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm p-4">
          <p className="text-sm text-muted-foreground text-center">
            Failed to load news
          </p>
        </div>
      </div>
    );
  }

  const newsItems = newsData?.items || [];
  // Filter published news only
  const publishedNews = newsItems
    .filter((item) => item.is_published)
    .slice(0, 8);

  return (
    <div className="w-full">
      <Link
        href="/news"
        className="text-sm px-2 block mb-2 text-primary-font hover:underline font-semibold"
      >
        <h2 className="text-lg md:text-xl font-bold">Latest News</h2>
      </Link>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {publishedNews.length > 0 ? (
          <div className="divide-y divide-border">
            {publishedNews.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="block px-3 py-2 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start ">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag name={getFirstTag(article)} variant="small" />
                      <h3 className="font-semibold line-clamp-1 text-sm md:text-base text-foreground min-w-0 flex-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {article.content.substring(0, 150)}
                      {article.content.length > 150 ? "..." : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No news available</p>
          </div>
        )}
      </div>
    </div>
  );
}
