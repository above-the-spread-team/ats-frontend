"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNews } from "@/services/fastapi/news";
import { Skeleton } from "@/components/ui/skeleton";
import NoData from "@/components/common/no-data";
import type { NewsResponse } from "@/type/fastapi/news";
import { getOptimizedNewsImage } from "@/lib/cloudinary";
import PreviewImage from "./components/preview-image";
import NewsFilter from "./components/news-filter";
import FullPage from "@/components/common/full-page";
import { getTagColor } from "@/data/league-theme";

export default function News() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Sort tag IDs to ensure consistent query keys
  const sortedTagIds =
    selectedTagIds.length > 0
      ? [...selectedTagIds].sort((a, b) => a - b)
      : undefined;

  const { data, isLoading, error } = useNews(1, 20, sortedTagIds);

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

  const getFirstTag = (news: NewsResponse) => {
    return news.tags && news.tags.length > 0 ? news.tags[0].name : "News";
  };

  // Check if news is a match preview (has team logos)
  const isMatchPreview = (news: NewsResponse) => {
    return !!(news.home_team_logo && news.away_team_logo);
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
        <NewsFilter
          selectedTagIds={selectedTagIds}
          onTagIdsChange={setSelectedTagIds}
        />
        <NoData
          message={
            selectedTagIds.length > 0
              ? "No news articles found for selected filters"
              : "No news articles available"
          }
          helpText={
            selectedTagIds.length > 0
              ? "Try adjusting your filter selections."
              : "Check back later for the latest football news."
          }
        />
      </div>
    );
  }

  // Filter published news
  const publishedNews = data.items.filter((item) => item.is_published);

  return (
    <FullPage>
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4  mb-8">
        {/* Tag Filter */}
        <NewsFilter
          selectedTagIds={selectedTagIds}
          onTagIdsChange={setSelectedTagIds}
        />

        {/* News Grid */}
        {publishedNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            {publishedNews.map((article) => (
              <Link key={article.id} href={`/news/${article.id}`}>
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="relative h-28 md:h-40 bg-muted">
                    {isMatchPreview(article) ? (
                      <PreviewImage
                        homeTeamLogo={article.home_team_logo}
                        awayTeamLogo={article.away_team_logo}
                        variant="grid"
                        tagName={getFirstTag(article)}
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
                        className="text-white text-xs font-bold px-2 py-0.5 md:py-1 rounded-full"
                        style={{
                          backgroundColor: getTagColor(getFirstTag(article)),
                        }}
                      >
                        {getFirstTag(article)}
                      </span>
                    </div>
                    {isMatchPreview(article) && (
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
    </FullPage>
  );
}
