"use client";

import Image from "next/image";
import Link from "next/link";
import { useNews } from "@/services/fastapi/news";
import { Skeleton } from "@/components/ui/skeleton";
import NoData from "@/components/common/no-data";
import type { NewsResponse } from "@/type/fastapi/news";
import { getOptimizedNewsImage } from "@/lib/cloudinary";
import PreviewImage from "./components/preview-image";

export default function News() {
  const { data, isLoading, error } = useNews(1, 20);

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
      year: "numeric",
    });
  };

  const getCategoryColor = (tagName: string) => {
    const colors: Record<string, string> = {
      "Premier League": "bg-purple-500",
      "La Liga": "bg-orange-500",
      "Serie A": "bg-blue-500",
      "Champions League": "bg-indigo-600",
      "Europa League": "bg-orange-600",
      "Transfer News": "bg-green-500",
      International: "bg-red-500",
    };
    return colors[tagName] || "bg-gray-500";
  };

  const getFirstTag = (news: NewsResponse) => {
    return news.tags && news.tags.length > 0 ? news.tags[0].name : "News";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen container mx-auto max-w-6xl bg-background p-2 md:p-6 pb-20 md:pb-6">
        <Skeleton className="h-8 w-64 mb-6" />
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen container mx-auto max-w-6xl bg-background p-2 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load news</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="min-h-screen container mx-auto max-w-6xl bg-background p-2 md:p-6 pb-20 md:pb-6">
        <NoData
          message="No news articles available"
          helpText="Check back later for the latest football news."
        />
      </div>
    );
  }

  // Filter published news
  const publishedNews = data.items.filter((item) => item.is_published);

  return (
    <div className="min-h-screen container mx-auto max-w-6xl bg-background p-2 md:p-6 pb-20 md:pb-6">
      {/* News Grid */}
      {publishedNews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {publishedNews.map((article) => (
            <Link key={article.id} href={`/news/${article.id}`}>
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="relative h-28 md:h-40 bg-muted">
                  {article.category === "match_preview" &&
                  article.home_team_logo &&
                  article.away_team_logo ? (
                    <PreviewImage
                      homeTeamLogo={article.home_team_logo}
                      awayTeamLogo={article.away_team_logo}
                      variant="grid"
                    />
                  ) : article.image_url ? (
                    <Image
                      src={getOptimizedNewsImage(article.image_url, 500)} // 500px for grid cards (optimized for 3-column layout)
                      alt={article.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-2xl">⚽</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`${getCategoryColor(
                        getFirstTag(article)
                      )} text-white text-xs font-bold px-2 py-0.5 md:py-1 rounded-full`}
                    >
                      {getFirstTag(article)}
                    </span>
                  </div>
                  {article.category === "match_preview" && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 md:p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    {article.author && (
                      <>
                        <span className="font-semibold truncate max-w-[60px] md:max-w-none">
                          {article.author.username}
                        </span>
                        <span className="flex-shrink-0">•</span>
                      </>
                    )}
                    <span className="flex-shrink-0">
                      {formatDate(article.created_at)}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs md:text-base mb-1.5 md:mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                    {article.content.substring(0, 150)}
                    {article.content.length > 150 ? "..." : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate mr-2 max-w-[140px]">
                      {article.comment_count > 0 && (
                        <>
                          <span>{article.comment_count} comments</span>
                        </>
                      )}
                    </div>
                    <span className="text-primary font-semibold text-xs hover:underline flex-shrink-0">
                      Read →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
