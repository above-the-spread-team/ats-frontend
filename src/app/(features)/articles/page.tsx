"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useNews, resolveArticleType } from "@/services/fastapi/news";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import type { NewsResponse, ArticleType } from "@/type/fastapi/news";

import { getOptimizedNewsImage } from "@/lib/cloudinary";
import PreviewImage from "./components/preview-image";
import ExpertPerspectiveImage from "./components/expert-perspective-image";
import NewsFilter from "./components/news-filter";
import FullPage from "@/components/common/full-page";
import { Tag } from "@/components/common/tag";

enum TabKey {
  NEWS = "news",
  EXPERT_PERSPECTIVES = "expert_perspectives",
}

const parseTabParam = (tab: string | null): TabKey =>
  tab === "expert" ? TabKey.EXPERT_PERSPECTIVES : TabKey.NEWS;

const getTabParam = (tab: TabKey): string =>
  tab === TabKey.EXPERT_PERSPECTIVES ? "expert" : "news";

function ArticleGrid({
  articles,
  data,
  page,
  onPageChange,
}: {
  articles: NewsResponse[];
  data: { total_pages: number } | undefined;
  page: number;
  onPageChange: (p: number) => void;
}) {
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

  const getFirstTag = (news: NewsResponse) => {
    return news.tags && news.tags.length > 0 ? news.tags[0].name : "News";
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
                        Preview
                      </span>
                    </div>
                  )}
                  {isExpertPerspective(article) && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Expert
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

function ArticleGridSkeleton() {
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

function NewsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = parseTabParam(searchParams.get("tab"));
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl);
  const [newsPage, setNewsPage] = useState(1);
  const [expertPage, setExpertPage] = useState(1);
  const pageSize = 15;

  const sortedTagIds =
    selectedTagIds.length > 0
      ? [...selectedTagIds].sort((a, b) => a - b)
      : undefined;

  // News tab: no article_type filter → shows general, match_preview, and expert all together
  // Expert Perspectives tab: filters to expert_perspective only
  const newsArticleType: ArticleType | undefined =
    activeTab === TabKey.EXPERT_PERSPECTIVES ? "expert_perspective" : undefined;

  const currentPage = activeTab === TabKey.NEWS ? newsPage : expertPage;

  const { data, isLoading, error } = useNews(
    currentPage,
    pageSize,
    sortedTagIds,
    newsArticleType,
  );

  // Reset to page 1 when tag filters change
  useEffect(() => {
    setNewsPage(1);
    setExpertPage(1);
  }, [selectedTagIds]);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Reset pages when switching tabs
  useEffect(() => {
    // keep the other tab's page
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    const nextTab = value as TabKey;
    const params = new URLSearchParams(searchParams.toString());

    params.set("tab", getTabParam(nextTab));
    setActiveTab(nextTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const allPublished = data?.items?.filter((item) => item.is_published) || [];

  // News tab: exclude expert_perspective articles (they have their own tab)
  // Expert Perspectives tab: already filtered server-side by article_type
  const publishedNews =
    activeTab === TabKey.NEWS
      ? allPublished.filter(
          (item) => resolveArticleType(item) !== "expert_perspective",
        )
      : allPublished;

  return (
    <FullPage>
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 mb-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-4 grid w-full px-1 grid-cols-2 bg-primary/10 gap-1">
            <TabsTrigger
              value={TabKey.NEWS}
              className="w-full data-[state=inactive]:text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-primary"
            >
              News
            </TabsTrigger>
            <TabsTrigger
              value={TabKey.EXPERT_PERSPECTIVES}
              className="w-full data-[state=inactive]:text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-primary"
            >
              Expert Perspectives
            </TabsTrigger>
          </TabsList>

          {/* Tag Filter */}
          <NewsFilter
            selectedTagIds={selectedTagIds}
            onTagIdsChange={setSelectedTagIds}
          />

          <TabsContent value={TabKey.NEWS}>
            {isLoading ? (
              <ArticleGridSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                  <p className="text-destructive mb-2">Failed to load news</p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Unknown error"}
                  </p>
                </div>
              </div>
            ) : publishedNews.length === 0 ? (
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
            ) : (
              <ArticleGrid
                articles={publishedNews}
                data={data}
                page={currentPage}
                onPageChange={setNewsPage}
              />
            )}
          </TabsContent>

          <TabsContent value={TabKey.EXPERT_PERSPECTIVES}>
            {isLoading ? (
              <ArticleGridSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                  <p className="text-destructive mb-2">
                    Failed to load expert perspectives
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Unknown error"}
                  </p>
                </div>
              </div>
            ) : publishedNews.length === 0 ? (
              <NoData
                message="No expert perspectives available"
                helpText="Check back later for expert analysis and perspectives."
              />
            ) : (
              <ArticleGrid
                articles={publishedNews}
                data={data}
                page={currentPage}
                onPageChange={setExpertPage}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FullPage>
  );
}

export default function News() {
  return (
    <Suspense
      fallback={
        <FullPage>
          <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 mb-8">
            <ArticleGridSkeleton />
          </div>
        </FullPage>
      }
    >
      <NewsContent />
    </Suspense>
  );
}
