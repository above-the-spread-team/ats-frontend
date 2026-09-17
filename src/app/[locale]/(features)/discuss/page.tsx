import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import PostContent from "./_components/post-content";

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
    path: "/discuss",
    title: t("discussTitle"),
    description: t("discussDescription"),
  });
}

export default async function DiscussPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PostContent groupId={null} />;
}
