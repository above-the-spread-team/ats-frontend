import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { buildPageMetadata } from "@/lib/seo";
import { NEWS_LIST_PAGE_SIZE } from "@/lib/news-query";
import { prefetchNewsFirstPage } from "@/lib/prefetch-news";
import NewsClient from "./_components/news-client";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return buildPageMetadata({
    locale,
    path: "/news",
    title: t("newsTitle"),
    description: t("newsDescription"),
  });
}

export default async function NewsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  // Same arguments as the unfiltered first render of NewsClient
  const dehydratedState = await prefetchNewsFirstPage({
    pageSize: NEWS_LIST_PAGE_SIZE,
    lang: locale === "en" ? undefined : locale,
    excludeArticleType: "expert_perspective",
  });

  return (
    <HydrationBoundary state={dehydratedState}>
      <h1 className="sr-only">{t("newsTitle")}</h1>
      <NewsClient />
    </HydrationBoundary>
  );
}
