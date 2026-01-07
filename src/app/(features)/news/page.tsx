"use client";

import Image from "next/image";
import Link from "next/link";
import { useNews } from "@/services/fastapi/news";
import { Skeleton } from "@/components/ui/skeleton";
import NoData from "@/components/common/no-data";
import type { NewsResponse } from "@/type/fastapi/news";

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
        {/* Featured Article Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-80 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
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
        <h1 className="text-lg md:text-2xl font-bold mb-3 md:mb-6 px-1 md:px-0">
          Latest Football News
        </h1>
        <NoData
          message="No news articles available"
          helpText="Check back later for the latest football news."
        />
      </div>
    );
  }

  // Split news into featured (first published article) and regular news
  const publishedNews = data.items.filter((item) => item.is_published);
  const [featuredArticle, ...regularNews] = publishedNews;

  return (
    <div className="min-h-screen container mx-auto max-w-6xl bg-background p-2 md:p-6 pb-20 md:pb-6">
      <h1 className="text-lg md:text-2xl font-bold mb-3 md:mb-6 px-1 md:px-0">
        Latest Football News
      </h1>

      {/* Featured Article */}
      {featuredArticle && (
        <div className="mb-4 md:mb-8">
          <Link href={`/news/${featuredArticle.id}`}>
            <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative h-40 md:h-80 bg-muted">
                {featuredArticle.image_url ? (
                  <Image
                    src={featuredArticle.image_url}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-4xl">⚽</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 md:top-3 md:left-3">
                  <span
                    className={`${getCategoryColor(
                      getFirstTag(featuredArticle)
                    )} text-white text-xs font-bold px-2 md:px-3 py-1 rounded-full`}
                  >
                    {getFirstTag(featuredArticle)}
                  </span>
                </div>
              </div>
              <div className="p-3 md:p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  {featuredArticle.author && (
                    <>
                      <span className="font-semibold truncate">
                        {featuredArticle.author.username}
                      </span>
                      <span className="flex-shrink-0">•</span>
                    </>
                  )}
                  <span className="flex-shrink-0">
                    {formatDate(featuredArticle.created_at)}
                  </span>
                </div>
                <h2 className="text-base md:text-2xl font-bold mb-2 md:mb-3 line-clamp-2 md:line-clamp-none">
                  {featuredArticle.title}
                </h2>
                <p className="text-xs md:text-base text-muted-foreground mb-2 md:mb-4 line-clamp-2 md:line-clamp-3">
                  {featuredArticle.content.substring(0, 200)}
                  {featuredArticle.content.length > 200 ? "..." : ""}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{featuredArticle.comment_count} comments</span>
                    {featuredArticle.reaction_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{featuredArticle.reaction_count} reactions</span>
                      </>
                    )}
                  </div>
                  <span className="text-primary font-semibold text-xs md:text-sm hover:underline flex-shrink-0">
                    Read More →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Regular News Grid */}
      {regularNews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {regularNews.map((article) => (
            <Link key={article.id} href={`/news/${article.id}`}>
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="relative h-28 md:h-40 bg-muted">
                  {article.image_url ? (
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover"
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
