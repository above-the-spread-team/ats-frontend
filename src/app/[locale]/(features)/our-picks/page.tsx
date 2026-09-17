import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { buildPageMetadata } from "@/lib/seo";
import { NEWS_LIST_PAGE_SIZE } from "@/lib/news-query";
import { prefetchNewsFirstPage } from "@/lib/prefetch-news";
import OurPicksClient from "./_components/our-picks-client";

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
    path: "/our-picks",
    title: t("ourPicksTitle"),
    description: t("ourPicksDescription"),
  });
}

export default async function OurPicksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  // Same arguments as the unfiltered first render of OurPicksClient
  const dehydratedState = await prefetchNewsFirstPage({
    pageSize: NEWS_LIST_PAGE_SIZE,
    lang: locale === "en" ? undefined : locale,
    articleType: "expert_perspective",
  });

  return (
    <HydrationBoundary state={dehydratedState}>
      <h1 className="sr-only">{t("ourPicksTitle")}</h1>
      <OurPicksClient />
    </HydrationBoundary>
  );
}
