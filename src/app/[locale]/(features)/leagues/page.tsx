import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import HubIndexPage, {
  buildHubIndexMetadata,
} from "@/components/common/hub-index-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildHubIndexMetadata({ locale, hubType: "league" });
}

export default async function LeaguesIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HubIndexPage locale={locale} hubType="league" />;
}
