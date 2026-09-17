import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import GamesClient from "./_components/games-client";

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
    path: "/games",
    title: t("gamesTitle"),
    description: t("gamesDescription"),
  });
}

export default async function GamesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GamesClient />;
}
