import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import FullPage from "@/components/common/full-page";
import NewsContentRenderer from "../components/news-content-renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, ExternalLink } from "lucide-react";
import { getOptimizedNewsImage } from "@/lib/cloudinary";
import { serverFetchNewsById } from "@/lib/server-news";
import PreviewImage from "../components/preview-image";
import ExpertPerspectiveImage from "../components/expert-perspective-image";
import { Tag } from "@/components/common/tag";
import NewsBackButton from "./_components/news-back-button";
import NewsCommentsLink from "./_components/news-comments-link";
import NewsReactions from "./_components/news-reactions";
import NewsCommentsSection from "./_components/news-comments-section";
import type { NewsResponse } from "@/type/fastapi/news";

function resolveArticleType(news: NewsResponse): string {
  if (news.article_type) return news.article_type;
  if (news.expert_name || news.expert_avatar_url) return "expert_perspective";
  if (news.fixture_id) return "match_preview";
  return "general";
}

function isMatchPreview(news: NewsResponse): boolean {
  return resolveArticleType(news) === "match_preview";
}

function isExpertPerspective(news: NewsResponse): boolean {
  return resolveArticleType(news) === "expert_perspective";
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(
    locale === "ja" ? "ja-JP" : locale === "zh-TW" ? "zh-TW" : locale === "zh-CN" ? "zh-CN" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

type RelativeTimeTranslator = (
  key: "time.justNow" | "time.hoursAgo" | "time.yesterday",
  values?: Record<string, number>,
) => string;

function formatRelativeDate(
  dateString: string,
  locale: string,
  t: RelativeTimeTranslator,
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) return t("time.justNow");
  if (diffInHours < 24) return t("time.hoursAgo", { hours: diffInHours });
  if (diffInHours < 48) return t("time.yesterday");
  return date.toLocaleDateString(
    locale === "ja" ? "ja-JP" : locale === "zh-TW" ? "zh-TW" : locale === "zh-CN" ? "zh-CN" : "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
}

function getFirstParagraph(news: NewsResponse): string {
  try {
    const content = news.content ? JSON.parse(news.content) : null;
    if (!content) return "";
    if (content.paragraphs?.[0]) return content.paragraphs[0];
    if (content.events?.[0]?.paragraphs?.[0]) return content.events[0].paragraphs[0];
    if (content.events?.[0]?.headline) return content.events[0].headline;
    return "";
  } catch {
    return "";
  }
}

interface PageProps {
  params: Promise<{ locale: string; "new-id": string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, "new-id": newId } = await params;
  const newsId = parseInt(newId);
  if (isNaN(newsId)) return { title: "Article Not Found" };

  const { data } = await serverFetchNewsById(newsId, locale === "en" ? undefined : locale);
  const news = data as NewsResponse | null;

  if (!news) return { title: "Article Not Found" };

  const description = getFirstParagraph(news).substring(0, 160);
  const availableLanguages = news.available_languages || (news.language ? [news.language] : ["en"]);

  const alternates: Record<string, string> = {};
  for (const lang of availableLanguages) {
    if (lang === "en") {
      alternates["en"] = `https://www.abovethespread.com/articles/${newsId}`;
      alternates["x-default"] = `https://www.abovethespread.com/articles/${newsId}`;
    } else {
      alternates[lang] = `https://www.abovethespread.com/${lang}/articles/${newsId}`;
    }
  }

  return {
    title: news.title,
    description,
    openGraph: {
      title: news.title,
      description,
      type: "article",
      publishedTime: news.created_at,
      modifiedTime: news.updated_at,
      locale:
        locale === "ja" ? "ja_JP" : locale === "zh-TW" ? "zh_TW" : locale === "zh-CN" ? "zh_CN" : "en_US",
      images: news.image_url
        ? [{ url: getOptimizedNewsImage(news.image_url, 1200), width: 1200, height: 630 }]
        : [],
    },
    alternates: {
      canonical: locale === "en"
        ? `https://www.abovethespread.com/articles/${newsId}`
        : `https://www.abovethespread.com/${locale}/articles/${newsId}`,
      languages: alternates,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale, "new-id": newId } = await params;
  const newsId = parseInt(newId);

  if (isNaN(newsId)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "articles" });

  const { data, error } = await serverFetchNewsById(
    newsId,
    locale === "en" ? undefined : locale,
  );
  const news = data as NewsResponse | null;

  if (error || !news) {
    return (
      <FullPage center>
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="text-destructive mb-2">{t("notFound")}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {t("notFoundHelp")}
          </p>
          <Link
            href="/articles"
            className="text-primary-font font-semibold hover:underline"
          >
            {t("backToNews")}
          </Link>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage>
      <div className="container mx-auto max-w-4xl px-2 mb-8">
        <NewsBackButton fallbackHref="/articles" />

        <Card className="overflow-hidden">
          {isMatchPreview(news) ? (
            <div className="relative w-full h-48 md:h-48">
              <PreviewImage
                homeTeamLogo={news.home_team_logo}
                awayTeamLogo={news.away_team_logo}
                variant="header"
                tagName={
                  news.tags && news.tags.length > 0
                    ? news.tags[0].name
                    : undefined
                }
              />
              {news.tags && news.tags.length > 0 && (
                <div className="absolute hidden md:block top-2 left-2 md:top-3 md:left-3">
                  <Tag name={news.tags[0].name} variant="large" />
                </div>
              )}
              <div className="absolute top-2 right-2 md:top-3 md:right-3">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  {t("badges.matchPreview")}
                </span>
              </div>
            </div>
          ) : isExpertPerspective(news) ? (
            <div className="relative w-full h-48 md:h-52">
              <ExpertPerspectiveImage
                homeTeamLogo={news.home_team_logo}
                awayTeamLogo={news.away_team_logo}
                expertName={news.expert_name}
                expertAvatarUrl={news.expert_avatar_url}
                variant="header"
                tagName={
                  news.tags && news.tags.length > 0
                    ? news.tags[0].name
                    : undefined
                }
              />
              {news.tags && news.tags.length > 0 && (
                <div className="absolute top-2 left-2 md:top-3 md:left-3">
                  <Tag name={news.tags[0].name} variant="large" />
                </div>
              )}
              <div className="absolute top-2 right-2 md:top-3 md:right-3">
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {t("badges.expert")}
                </span>
              </div>
            </div>
          ) : news.image_url ? (
            <div className="relative w-full h-64 md:h-96 bg-muted">
              <Image
                src={getOptimizedNewsImage(news.image_url, 1600)}
                alt={news.title}
                fill
                className="object-cover"
                unoptimized
              />
              {news.tags && news.tags.length > 0 && (
                <div className="absolute top-4 left-4">
                  <Tag name={news.tags[0].name} variant="large" />
                </div>
              )}
            </div>
          ) : null}

          <CardContent className="p-4 md:p-6">
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold mb-4">
                {news.title}
              </h1>

              <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
                <div>
                  {news.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{news.author.username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(news.created_at, locale)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <NewsCommentsLink count={news.comment_count} />

                  <NewsReactions
                    newsId={newsId}
                    initialLikes={news.likes}
                    initialDislikes={news.dislikes}
                    initialUserReaction={news.user_reaction}
                  />

                  {isMatchPreview(news) && news.fixture_id && (
                    <Link
                      href={`/games/detail?id=${news.fixture_id}`}
                      className="flex items-center gap-2 text-primary-font hover:underline ml-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{t("viewFixture")}</span>
                    </Link>
                  )}
                </div>
              </div>

              {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {news.tags.map((tag) => (
                    <Tag
                      key={tag.id}
                      name={tag.name}
                      variant="medium"
                      href={`/discuss?tag=${tag.id}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {news.content && <NewsContentRenderer content={news.content} />}

            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="hidden md:block">
                  {t("published", {
                    time: formatRelativeDate(news.created_at, locale, t),
                  })}
                </span>
                {news.updated_at !== news.created_at && (
                  <span>
                    &bull;{" "}
                    {t("updatedTime", {
                      time: formatRelativeDate(news.updated_at, locale, t),
                    })}
                  </span>
                )}
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-primary-font rounded-full border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t("backToNews")}
              </Link>
            </div>
          </CardContent>
        </Card>

        <NewsCommentsSection newsId={newsId} />
      </div>
    </FullPage>
  );
}
