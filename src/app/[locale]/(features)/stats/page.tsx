import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import StatsClient from "./_components/stats-client";

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
    path: "/stats",
    title: t("statsTitle"),
    description: t("statsDescription"),
  });
}

export default async function StatsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StatsClient />;
}
