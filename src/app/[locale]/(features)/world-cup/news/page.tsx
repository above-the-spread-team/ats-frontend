import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { buildPageMetadata } from "@/lib/seo";
import { NEWS_LIST_PAGE_SIZE, WORLD_CUP_TAG_IDS } from "@/lib/news-query";
import { prefetchNewsFirstPage } from "@/lib/prefetch-news";
import WorldCupNewsClient from "./_components/world-cup-news-client";

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
    path: "/world-cup/news",
    title: t("worldCupNewsTitle"),
    description: t("worldCupNewsDescription"),
  });
}

export default async function WorldCupNewsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Same arguments as the first render of WorldCupNewsClient
  const dehydratedState = await prefetchNewsFirstPage({
    pageSize: NEWS_LIST_PAGE_SIZE,
    lang: locale === "en" ? undefined : locale,
    tagIds: WORLD_CUP_TAG_IDS,
  });

  return (
    <HydrationBoundary state={dehydratedState}>
      <WorldCupNewsClient />
    </HydrationBoundary>
  );
}
