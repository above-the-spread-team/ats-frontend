import { notFound } from "next/navigation";
import Image from "next/image";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { articleUrlSegment, parseArticleId } from "@/lib/article-url";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import FullPage from "@/components/common/full-page";
import NewsContentRenderer from "../components/news-content-renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, ExternalLink } from "lucide-react";
import { getOgNewsImage, getOptimizedNewsImage } from "@/lib/cloudinary";
import { serverFetchNewsById } from "@/lib/server-news";
import { getLeadText, parseNewsContent } from "@/lib/news-content";
import { gamePath } from "@/lib/game-url";
import { hubPath } from "@/lib/hub-url";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  clampDescription,
  feedUrl,
  languageAlternates,
  localizedUrl,
  ogLocale,
} from "@/lib/seo";
import {
  JsonLd,
  breadcrumbLd,
  faqLd,
  graphLd,
  newsArticleLd,
  sportsEventLd,
} from "@/lib/json-ld";
import PreviewImage from "../components/preview-image";
import ExpertPerspectiveImage from "../components/expert-perspective-image";
import { Tag } from "@/components/common/tag";
import NewsBackButton from "./_components/news-back-button";
import NewsCommentsLink from "./_components/news-comments-link";
import NewsReactions from "./_components/news-reactions";
import NewsCommentsSection from "./_components/news-comments-section";
import type { NewsResponse, ParsedNewsContent } from "@/type/fastapi/news";

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
    LOCALE_TAGS[locale] ?? "en-US",
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
    LOCALE_TAGS[locale] ?? "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
}

const LOCALE_TAGS: Record<string, string> = {
  ja: "ja-JP",
  "zh-TW": "zh-TW",
  "zh-CN": "zh-CN",
};

function articleLanguages(news: NewsResponse): string[] {
  return news.available_languages?.length
    ? news.available_languages
    : [news.language ?? "en"];
}

/** LLM-written meta description when the article has one, else the clamped lead paragraph. */
function articleDescription(
  parsed: ParsedNewsContent | null,
  locale: string,
): string {
  return clampDescription(parsed?.meta_description || getLeadText(parsed), locale);
}

/**
 * Social image, always a true 1200×630: the cover crop for general news, a generated
 * team-logo card for match previews / expert perspectives (which have no cover image).
 */
function articleOgImage(news: NewsResponse) {
  const type = resolveArticleType(news);
  if (type !== "general" && news.home_team_name && news.away_team_name) {
    // updated_at busts social-platform caches when the article is regenerated
    const version = encodeURIComponent(news.updated_at);
    return {
      url: `${SITE_URL}/og/article/${news.id}?v=${version}`,
      width: 1200,
      height: 630,
      alt: `${news.home_team_name} vs ${news.away_team_name}`,
    };
  }
  const cover = type === "general" ? getOgNewsImage(news.image_url) : null;
  return cover
    ? { url: cover, width: 1200, height: 630, alt: news.title }
    : DEFAULT_OG_IMAGE;
}

interface PageProps {
  params: Promise<{ locale: string; "new-id": string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, "new-id": newId } = await params;
  const newsId = parseArticleId(newId);
  if (newsId === null) return { title: "Article Not Found" };

  const { data } = await serverFetchNewsById(newsId, locale === "en" ? undefined : locale);
  const news = data as NewsResponse | null;

  if (!news || !news.is_published) return { title: "Article Not Found" };

  const parsed = news.content ? parseNewsContent(news.content) : null;
  const description = articleDescription(parsed, locale);
  const path = `/articles/${articleUrlSegment(news)}`;
  const canonical = localizedUrl(locale, path);
  const image = articleOgImage(news);
  const tagNames = news.tags?.map((tag) => tag.name) ?? [];

  return {
    title: news.title,
    description,
    openGraph: {
      title: news.title,
      description,
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      publishedTime: news.created_at,
      modifiedTime: news.updated_at,
      section: tagNames[0],
      tags: tagNames,
      locale: ogLocale(locale),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description,
      images: [image.url],
      creator: "@abovethespread",
    },
    alternates: {
      canonical,
      languages: languageAlternates(path, articleLanguages(news)),
      types: { "application/rss+xml": feedUrl(locale) },
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale, "new-id": newId } = await params;
  const newsId = parseArticleId(newId);

  if (newsId === null) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "articles" });

  const { data, status } = await serverFetchNewsById(
    newsId,
    locale === "en" ? undefined : locale,
  );
  const news = data as NewsResponse | null;

  // A real 404 for missing / unpublished articles; a backend outage must surface as a 5xx
  // (error boundary), never as a "not found" page that would get the URL de-indexed.
  if (status === 404 || (news && !news.is_published)) notFound();
  if (!news) throw new Error(`Failed to load article ${newsId} (status ${status})`);

  // Bare-id and stale-slug URLs permanently redirect to the canonical slug URL
  const canonicalSegment = articleUrlSegment(news);
  if (newId !== canonicalSegment) {
    permanentRedirect({ href: `/articles/${canonicalSegment}`, locale });
  }

  const parsed = news.content ? parseNewsContent(news.content) : null;
  const articleType = resolveArticleType(news);
  const pageUrl = localizedUrl(locale, `/articles/${canonicalSegment}`);
  const hasMatch = Boolean(news.home_team_name && news.away_team_name);
  const matchPath =
    articleType !== "general" && news.fixture_id
      ? gamePath({
          id: news.fixture_id,
          home: news.home_team_name,
          away: news.away_team_name,
        })
      : null;
  const leagueTag = news.tags?.find((tag) => tag.type === "league");
  const leaguePath = leagueTag ? hubPath(leagueTag) : undefined;
  const section =
    articleType === "expert_perspective"
      ? { name: t("breadcrumb.expertPicks"), path: "/our-picks" }
      : { name: t("breadcrumb.news"), path: "/news" };
  // Same locale-independent @id as the match page's SportsEvent, so both describe one entity
  const eventId =
    hasMatch && news.match_date && matchPath
      ? `${SITE_URL}${matchPath}#event`
      : undefined;

  const structuredData = graphLd([
    newsArticleLd({
      url: pageUrl,
      headline: news.title,
      description: articleDescription(parsed, locale),
      image: articleOgImage(news).url,
      datePublished: news.created_at,
      dateModified: news.updated_at,
      locale,
      section: leagueTag?.name,
      keywords: news.tags?.map((tag) => tag.name),
      aboutEventId: eventId,
    }),
    breadcrumbLd([
      { name: t("breadcrumb.home"), url: localizedUrl(locale, "/") },
      { name: section.name, url: localizedUrl(locale, section.path) },
      ...(leagueTag && leaguePath
        ? [{ name: leagueTag.name, url: localizedUrl(locale, leaguePath) }]
        : []),
      { name: news.title, url: pageUrl },
    ]),
    eventId && matchPath
      ? sportsEventLd({
          id: eventId,
          url: localizedUrl(locale, matchPath),
          home: { name: news.home_team_name!, logo: news.home_team_logo },
          away: { name: news.away_team_name!, logo: news.away_team_logo },
          startDate: news.match_date!,
          competition: leagueTag?.name,
        })
      : null,
    parsed?.faq?.length ? faqLd(pageUrl, parsed.faq) : null,
  ]);

  return (
    <FullPage>
      <JsonLd data={structuredData} />
      <article className="container mx-auto max-w-4xl px-2 mb-8">
        <NewsBackButton fallbackHref={section.path} />

        <nav
          aria-label={t("breadcrumb.label")}
          className="mb-3 px-1 text-xs text-muted-foreground"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:underline">
                {t("breadcrumb.home")}
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href={section.path} className="hover:underline">
                {section.name}
              </Link>
            </li>
            {leagueTag && leaguePath && (
              <>
                <li aria-hidden>›</li>
                <li>
                  <Link href={leaguePath} className="hover:underline">
                    {leagueTag.name}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

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
                    <time dateTime={news.created_at}>
                      {formatDate(news.created_at, locale)}
                    </time>
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

                  {matchPath && (
                    <Link
                      href={matchPath}
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
                      href={hubPath(tag)}
                    />
                  ))}
                </div>
              )}
            </div>

            {news.content && (
              <NewsContentRenderer
                content={news.content}
                parsed={parsed}
                expertName={news.expert_name}
              />
            )}

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
                href={section.path}
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
      </article>
    </FullPage>
  );
}
