"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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

import { getOptimizedNewsImage } from "@/lib/cloudinary";
import { resolveArticleType } from "@/services/fastapi/news";
import PreviewImage from "./preview-image";
import ExpertPerspectiveImage from "./expert-perspective-image";
import { Tag } from "@/components/common/tag";

function ArticleGrid({
  articles,
  data,
  page,
  onPageChange,
  locale = "en",
}: {
  articles: NewsResponse[];
  data: { total_pages: number } | undefined;
  page: number;
  onPageChange: (p: number) => void;
  locale?: string;
}) {
  const t = useTranslations("articles");
  const c = useTranslations("common");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return t("time.justNow");
    if (diffInHours < 24) return t("time.hoursAgo", { hours: diffInHours });
    if (diffInHours < 48) return t("time.yesterday");
    return date.toLocaleDateString(
      locale === "ja" ? "ja-JP" : locale === "zh-TW" ? "zh-TW" : locale === "zh-CN" ? "zh-CN" : "en-US",
      { month: "short", day: "numeric", year: "numeric" },
    );
  };

  const getFirstTag = (news: NewsResponse) => {
    return news.tags && news.tags.length > 0 ? news.tags[0].name : t("title");
  };

  const isMatchPreview = (news: NewsResponse) => {
    return resolveArticleType(news) === "match_preview";
  };

  const isExpertPerspective = (news: NewsResponse) => {
    return resolveArticleType(news) === "expert_perspective";
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.id}`}>
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
                  ) : isExpertPerspective(article) ? (
                    <ExpertPerspectiveImage
                      homeTeamLogo={article.home_team_logo}
                      awayTeamLogo={article.away_team_logo}
                      expertName={article.expert_name}
                      expertAvatarUrl={article.expert_avatar_url}
                      variant="grid"
                      tagName={getFirstTag(article)}
                    />
                  ) : article.image_url ? (
                    <Image
                      src={getOptimizedNewsImage(article.image_url, 700)}
                      alt={article.title}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src="https://images.unsplash.com/photo-1430232324554-8f4aebd06683?w=800&q=70&auto=format&fit=crop"
                      alt="Soccer stadium"
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  )}
                  <div className="absolute top-2 left-2">
                    <Tag name={getFirstTag(article)} variant="medium" />
                  </div>
                  {isMatchPreview(article) && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {t("badges.preview")}
                      </span>
                    </div>
                  )}
                  {isExpertPerspective(article) && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {t("badges.expert")}
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

                  <h3 className="font-bold text-xs md:text-base mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary-font transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {article.content_preview ?? ""}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs">
                    <div className="text-muted-foreground">
                      {article.comment_count > 0
                        ? t("comments.commentsCount", { count: article.comment_count })
                        : t("comments.noComments")}
                    </div>
                    <span className="text-primary-font font-semibold hover:underline">
                      {c("readMore")}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
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
                      onPageChange(page - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
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

                if (totalPages > 0) {
                  pages.push(1);
                }

                if (page > 3) {
                  pages.push("ellipsis");
                }

                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);

                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                  }
                }

                if (page < totalPages - 2) {
                  pages.push("ellipsis");
                }

                if (totalPages > 1) {
                  pages.push(totalPages);
                }

                const uniquePages: (number | "ellipsis")[] = [];
                let lastNum = 0;
                for (const p of pages) {
                  if (p === "ellipsis") {
                    if (
                      uniquePages.length === 0 ||
                      uniquePages[uniquePages.length - 1] !== "ellipsis"
                    ) {
                      uniquePages.push("ellipsis");
                    }
                  } else {
                    if (p > lastNum) {
                      uniquePages.push(p);
                      lastNum = p;
                    }
                  }
                }

                return uniquePages.map((p, idx) => {
                  if (p === "ellipsis") {
                    return (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(p);
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                        isActive={p === page}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                });
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < data.total_pages) {
                      onPageChange(page + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
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
    </>
  );
}

export function ArticleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

interface ArticleListViewProps {
  articles: NewsResponse[];
  data: { total_pages: number } | undefined;
  page: number;
  onPageChange: (p: number) => void;
  isLoading: boolean;
  error: unknown;
  emptyMessage: string;
  emptyHelpText: string;
  errorLabel?: string;
  locale?: string;
}

export function ArticleListView({
  articles,
  data,
  page,
  onPageChange,
  isLoading,
  error,
  emptyMessage,
  emptyHelpText,
  errorLabel,
  locale = "en",
}: ArticleListViewProps) {
  const t = useTranslations("articles");
  const c = useTranslations("common");

  if (isLoading) {
    return <ArticleGridSkeleton />;
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "detail" in error
          ? String((error as { detail: string }).detail)
          : c("unknown");

    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-destructive mb-2">{errorLabel ?? t("loadError")}</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return <NoData message={emptyMessage} helpText={emptyHelpText} />;
  }

  return (
    <ArticleGrid
      articles={articles}
      data={data}
      page={page}
      onPageChange={onPageChange}
      locale={locale}
    />
  );
}
