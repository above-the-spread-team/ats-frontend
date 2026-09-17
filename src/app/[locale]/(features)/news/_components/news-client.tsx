"use client";

import { Suspense, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useNews, resolveArticleType } from "@/services/fastapi/news";
import { ArticleListView, ArticleGridSkeleton } from "@/app/[locale]/(features)/articles/components/article-list-view";
import NewsFilter from "@/app/[locale]/(features)/articles/components/news-filter";
import FullPage from "@/components/common/full-page";
import { NEWS_LIST_PAGE_SIZE } from "@/lib/news-query";

function NewsContent() {
  const locale = useLocale();
  const t = useTranslations("articles");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = NEWS_LIST_PAGE_SIZE;

  const sortedTagIds =
    selectedTagIds.length > 0
      ? [...selectedTagIds].sort((a, b) => a - b)
      : undefined;

  const lang = locale === "en" ? undefined : locale;

  // Expert perspectives live on /our-picks; excluding them server-side keeps page counts right
  const { data, isLoading, error } = useNews(
    page,
    pageSize,
    sortedTagIds,
    undefined,
    lang,
    "expert_perspective",
  );

  useEffect(() => {
    setPage(1);
  }, [selectedTagIds]);

  // The type check is a no-op once the backend honours exclude_article_type; it only
  // matters while an older backend (which ignores the param) is still deployed.
  const publishedNews = (data?.items ?? []).filter(
    (item) =>
      item.is_published && resolveArticleType(item) !== "expert_perspective",
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
              ? t("empty.filtered")
              : t("empty.general")
          }
          emptyHelpText={
            selectedTagIds.length > 0
              ? t("empty.tryAdjusting")
              : t("empty.checkBack")
          }
          errorLabel={t("loadError")}
          locale={locale}
        />
      </div>
    </FullPage>
  );
}

export default function NewsClient() {
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
