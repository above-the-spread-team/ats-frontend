"use client";

import { Suspense, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useNews } from "@/services/fastapi/news";
import { ArticleListView, ArticleGridSkeleton } from "@/app/[locale]/(features)/articles/components/article-list-view";
import NewsFilter from "@/app/[locale]/(features)/articles/components/news-filter";
import FullPage from "@/components/common/full-page";

function OurPicksContent() {
  const locale = useLocale();
  const t = useTranslations("articles");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const sortedTagIds =
    selectedTagIds.length > 0
      ? [...selectedTagIds].sort((a, b) => a - b)
      : undefined;

  const lang = locale === "en" ? undefined : locale;

  const { data, isLoading, error } = useNews(
    page,
    pageSize,
    sortedTagIds,
    "expert_perspective",
    lang,
  );

  useEffect(() => {
    setPage(1);
  }, [selectedTagIds]);

  const publishedNews = data?.items?.filter((item) => item.is_published) || [];

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
          emptyMessage={t("empty.filtered")}
          emptyHelpText={t("empty.tryAdjusting")}
          errorLabel={t("loadError")}
          locale={locale}
        />
      </div>
    </FullPage>
  );
}

export default function OurPicks() {
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
      <OurPicksContent />
    </Suspense>
  );
}
