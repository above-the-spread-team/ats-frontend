"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNews } from "@/services/fastapi/news";
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
import NoData from "@/components/common/no-data";
import type { NewsResponse } from "@/type/fastapi/news";
import { getNewsPreview } from "@/lib/news-content";
import { getOptimizedNewsImage } from "@/lib/cloudinary";
import PreviewImage from "../../news/components/preview-image";
import { Tag } from "@/components/common/tag";

const WORLD_CUP_TAG_ID = 104;
const PAGE_SIZE = 15;

export default function WorldCupNews() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useNews(page, PAGE_SIZE, [
    WORLD_CUP_TAG_ID,
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
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

  const getFirstTag = (news: NewsResponse) =>
    news.tags && news.tags.length > 0 ? news.tags[0].name : "World Cup";

  const isMatchPreview = (news: NewsResponse) =>
    !!(news.home_team_logo && news.away_team_logo);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-6 pb-20 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-40 w-full mb-4 rounded-xl" />
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
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-center min-h-[40vh]">
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

  const publishedNews = data?.items?.filter((item) => item.is_published) ?? [];

  if (!isLoading && !error && publishedNews.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <NoData
          message="No World Cup news yet"
          helpText="Check back soon for the latest 2026 World Cup coverage."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 mb-8 space-y-4">
      {/* Article count */}
      {data && (
        <p className="text-xs text-muted-foreground">
          {data.total} article{data.total !== 1 ? "s" : ""}
        </p>
      )}

      {/* News Articles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {publishedNews.map((article) => (
          <Link key={article.id} href={`/news/${article.id}`}>
            <article className="h-full bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary-font/30 transition-all duration-200 cursor-pointer group">
              <div className="flex h-full flex-col">
                <div className="relative h-44 bg-muted">
                  {isMatchPreview(article) ? (
                    <PreviewImage
                      homeTeamLogo={article.home_team_logo}
                      awayTeamLogo={article.away_team_logo}
                      variant="grid"
                      tagName={getFirstTag(article)}
                    />
                  ) : article.image_url ? (
                    <Image
                      src={getOptimizedNewsImage(article.image_url, 700)}
                      alt={article.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="https://images.unsplash.com/photo-1430232324554-8f4aebd06683?w=800&q=70&auto=format&fit=crop"
                      alt="Soccer stadium"
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2 left-2">
                    <Tag name={getFirstTag(article)} variant="medium" />
                  </div>

                  {isMatchPreview(article) && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Preview
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-4 flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    {article.author && (
                      <>
                        <span className="font-semibold truncate max-w-[120px] md:max-w-none">
                          {article.author.username}
                        </span>
                        <span className="flex-shrink-0">•</span>
                      </>
                    )}
                    <span className="flex-shrink-0">
                      {formatDate(article.created_at)}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs md:text-base mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary-font transition-colors duration-150">
                    {article.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {getNewsPreview(article.content)}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs">
                    <div className="text-muted-foreground">
                      {article.comment_count > 0
                        ? `${article.comment_count} comments`
                        : "No comments yet"}
                    </div>
                    <span className="text-primary-font font-semibold hover:underline">
                      Read →
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) {
                      setPage(page - 1);
                      scrollTop();
                    }
                  }}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {(() => {
                const pages: (number | "ellipsis")[] = [];
                const totalPages = data.total_pages;

                if (totalPages > 0) pages.push(1);
                if (page > 3) pages.push("ellipsis");

                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);
                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalPages) pages.push(i);
                }

                if (page < totalPages - 2) pages.push("ellipsis");
                if (totalPages > 1) pages.push(totalPages);

                const unique: (number | "ellipsis")[] = [];
                let last = 0;
                for (const p of pages) {
                  if (p === "ellipsis") {
                    if (unique[unique.length - 1] !== "ellipsis")
                      unique.push("ellipsis");
                  } else if (p > last) {
                    unique.push(p);
                    last = p;
                  }
                }

                return unique.map((p, idx) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                          scrollTop();
                        }}
                        isActive={p === page}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                );
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < data.total_pages) {
                      setPage(page + 1);
                      scrollTop();
                    }
                  }}
                  className={
                    page === data.total_pages
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
