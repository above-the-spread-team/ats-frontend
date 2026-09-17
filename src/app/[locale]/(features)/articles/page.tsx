import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { buildPageMetadata } from "@/lib/seo";
import { NEWS_LIST_PAGE_SIZE } from "@/lib/news-query";
import { prefetchNewsFirstPage } from "@/lib/prefetch-news";
import ArticlesClient from "./_components/articles-client";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Mirrors parseTabParam in ArticlesClient: only "expert" selects the expert tab
function isExpertTab(tab: string | string[] | undefined): boolean {
  return tab === "expert";
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { tab } = await searchParams;
  const t = await getTranslations({ locale, namespace: "metadata" });

  // /articles is a tabbed duplicate of /news and /our-picks (the mobile nav links here);
  // each tab canonicalises to its standalone list so ranking signals land on one URL.
  return buildPageMetadata({
    locale,
    path: "/articles",
    canonicalPath: isExpertTab(tab) ? "/our-picks" : "/news",
    title: t("articlesTitle"),
    description: t("articlesDescription"),
  });
}

export default async function ArticlesPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { tab } = await searchParams;
  setRequestLocale(locale);

  // Same arguments as the unfiltered first render of the active tab in ArticlesClient
  const dehydratedState = await prefetchNewsFirstPage({
    pageSize: NEWS_LIST_PAGE_SIZE,
    lang: locale === "en" ? undefined : locale,
    ...(isExpertTab(tab)
      ? { articleType: "expert_perspective" as const }
      : { excludeArticleType: "expert_perspective" as const }),
  });

  return (
    <HydrationBoundary state={dehydratedState}>
      <ArticlesClient />
    </HydrationBoundary>
  );
}
