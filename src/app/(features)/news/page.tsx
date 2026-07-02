"use client";

import { Suspense, useState, useEffect } from "react";
import { useNews, resolveArticleType } from "@/services/fastapi/news";
import { ArticleListView, ArticleGridSkeleton } from "@/app/(features)/articles/components/article-list-view";
import NewsFilter from "@/app/(features)/articles/components/news-filter";
import FullPage from "@/components/common/full-page";

function NewsContent() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const sortedTagIds =
    selectedTagIds.length > 0
      ? [...selectedTagIds].sort((a, b) => a - b)
      : undefined;

  const { data, isLoading, error } = useNews(page, pageSize, sortedTagIds);

  useEffect(() => {
    setPage(1);
  }, [selectedTagIds]);

  const allPublished = data?.items?.filter((item) => item.is_published) || [];
  const publishedNews = allPublished.filter(
    (item) => resolveArticleType(item) !== "expert_perspective",
  );

  return (
    <FullPage>
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 mb-8">
        <NewsFilter
          selectedTagIds={selectedTagIds}
          onTagIdsChange={setSelectedTagIds}
        />
        <ArticleListView
          articles={publishedNews}
          data={data}
          page={page}
          onPageChange={setPage}
          isLoading={isLoading}
          error={error}
          emptyMessage={
            selectedTagIds.length > 0
              ? "No news articles found for selected filters"
              : "No news articles available"
          }
          emptyHelpText={
            selectedTagIds.length > 0
              ? "Try adjusting your filter selections."
              : "Check back later for the latest football news."
          }
          errorLabel="Failed to load news"
        />
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
