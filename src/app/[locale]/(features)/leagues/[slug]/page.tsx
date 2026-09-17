import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import HubPage, {
  buildHubMetadata,
  parseHubPageParam,
} from "@/components/common/hub-page";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const { page } = await searchParams;

  return buildHubMetadata({
    locale,
    slugParam: slug,
    hubType: "league",
    page: parseHubPageParam(page),
  });
}

export default async function LeagueHubRoute({
  params,
  searchParams,
}: PageProps) {
  const { locale, slug } = await params;
  const { page } = await searchParams;
  setRequestLocale(locale);

  return (
    <HubPage
      locale={locale}
      slugParam={slug}
      hubType="league"
      page={parseHubPageParam(page)}
    />
  );
}
