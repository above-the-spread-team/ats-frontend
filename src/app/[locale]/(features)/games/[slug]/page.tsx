import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { gamePath, gameUrlSegment, parseGameId } from "@/lib/game-url";
import { articlePath } from "@/lib/article-url";
import { serverFetchFixture } from "@/lib/server-fixture";
import { serverFetchNewsList } from "@/lib/server-news";
import { SITE_URL, buildPageMetadata, localizedUrl } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbLd,
  graphLd,
  sportsEventLd,
  type EventStatus,
} from "@/lib/json-ld";
import { getFixtureStatus } from "@/data/fixture-status";
import type { FixtureResponseItem } from "@/type/footballapi/fixture";
import type { NewsListResponse, NewsResponse } from "@/type/fastapi/news";
import GameDetailClient from "./_components/game-detail-client";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    date?: string | string[];
    tab?: string | string[];
  }>;
}

// serverFetchFixture passes an AbortSignal, which opts the fetch out of React's
// per-request dedupe — cache() keeps generateMetadata + the page on one call.
const getFixture = cache((fixtureId: number) => serverFetchFixture(fixtureId));

/** ?date= / ?tab= survive redirects; everything else is dropped. */
function pickQuery(
  searchParams: Awaited<PageProps["searchParams"]>,
): Record<string, string> {
  const query: Record<string, string> = {};
  for (const key of ["date", "tab"] as const) {
    const value = searchParams[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) query[key] = first;
  }
  return query;
}

function formatMatchDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

function teamNames(fixture: FixtureResponseItem) {
  return {
    home: fixture.teams.home.name,
    away: fixture.teams.away.name,
    league: fixture.league?.name?.trim() || "",
  };
}

type RelatedArticleType = "match_preview" | "expert_perspective";

function relatedArticleType(news: NewsResponse): RelatedArticleType | null {
  if (news.article_type === "match_preview") return "match_preview";
  if (news.article_type === "expert_perspective") return "expert_perspective";
  if (news.article_type) return null;
  // List responses may omit article_type — same fallback as resolveArticleType()
  if (news.expert_name || news.expert_avatar_url) return "expert_perspective";
  return news.fixture_id ? "match_preview" : null;
}

/** Preview / expert pick of this fixture. Best effort: a backend hiccup just hides the block. */
async function fetchRelatedArticles(
  fixtureId: number,
  locale: string,
): Promise<Array<{ news: NewsResponse; type: RelatedArticleType }>> {
  const { data } = await serverFetchNewsList(
    1,
    5,
    locale === "en" ? undefined : locale,
    undefined,
    undefined,
    { fixtureId },
  );
  const items = (data as NewsListResponse | null)?.items;
  if (!Array.isArray(items)) return [];

  const related: Array<{ news: NewsResponse; type: RelatedArticleType }> = [];
  for (const news of items) {
    // Guards against a backend that ignores the fixture_id filter
    if (news.fixture_id !== fixtureId) continue;
    const type = relatedArticleType(news);
    if (type) related.push({ news, type });
  }
  return related;
}

function eventStatus(statusType: string): EventStatus {
  if (statusType === "Postponed") return "EventPostponed";
  if (statusType === "Cancelled") return "EventCancelled";
  // schema.org has no "live" / "finished" status — those stay EventScheduled
  return "EventScheduled";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const fixtureId = parseGameId(slug);
  if (fixtureId === null) return { title: "Match Not Found" };

  const { fixture } = await getFixture(fixtureId);
  if (!fixture) return { title: "Match Not Found" };

  const t = await getTranslations({ locale, namespace: "metadata" });
  const { home, away, league } = teamNames(fixture);
  const date = formatMatchDate(fixture.fixture.date, locale);

  return buildPageMetadata({
    locale,
    // Canonical never carries ?date= / ?tab=
    path: gamePath({ id: fixtureId, home, away }),
    title: league
      ? t("gameTitle", { home, away, league })
      : t("gameTitleNoLeague", { home, away }),
    description: league
      ? t("gameDescription", { home, away, league, date })
      : t("gamesDescription"),
  });
}

export default async function GameDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const fixtureId = parseGameId(slug);
  if (fixtureId === null) notFound();

  const { fixture, status } = await getFixture(fixtureId);
  if (!fixture) {
    if (status === 404) notFound();
    // Upstream outage / quota: answer 5xx so crawlers retry instead of de-indexing a soft 404
    throw new Error(
      `Fixture ${fixtureId} is unavailable (upstream status ${status})`,
    );
  }

  const { home, away, league } = teamNames(fixture);

  // Bare-id and stale-slug URLs permanently redirect to the canonical segment (one hop)
  const canonicalSegment = gameUrlSegment({ id: fixtureId, home, away });
  if (slug !== canonicalSegment) {
    permanentRedirect({
      href: {
        pathname: `/games/${canonicalSegment}`,
        query: pickQuery(await searchParams),
      },
      locale,
    });
  }

  const [t, tNav, tCommon, related] = await Promise.all([
    getTranslations({ locale, namespace: "gamesDetail" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    fetchRelatedArticles(fixtureId, locale),
  ]);

  const path = gamePath({ id: fixtureId, home, away });
  const url = localizedUrl(locale, path);
  const matchName = `${home} vs ${away}`;
  const date = formatMatchDate(fixture.fixture.date, locale);
  const statusType = getFixtureStatus(fixture.fixture.status.short).type;
  const venue = fixture.fixture.venue?.name?.trim();
  const { home: homeGoals, away: awayGoals } = fixture.goals;
  const hasScore = homeGoals !== null && awayGoals !== null;

  let summary = "";
  if (league) {
    const base = { home, away, league, date };
    if (statusType === "Scheduled") {
      summary = venue
        ? t("summaryScheduledVenue", { ...base, venue })
        : t("summaryScheduled", base);
    } else if (statusType === "In Play" && hasScore) {
      summary = t("summaryLive", { ...base, homeGoals, awayGoals });
    } else if (statusType === "Finished" && hasScore) {
      summary = t("summaryFinished", { ...base, homeGoals, awayGoals });
    } else {
      summary = t("summaryOther", {
        ...base,
        status: fixture.fixture.status.long,
      });
    }
  }

  const breadcrumbs = [
    { name: tNav("home"), href: "/", url: localizedUrl(locale, "/") },
    {
      name: t("breadcrumbGames"),
      href: "/games",
      url: localizedUrl(locale, "/games"),
    },
  ];

  return (
    <>
      <JsonLd
        data={graphLd([
          sportsEventLd({
            // One real-world event across all locales → locale-independent @id
            id: `${SITE_URL}${path}#event`,
            url,
            home: { name: home, logo: fixture.teams.home.logo },
            away: { name: away, logo: fixture.teams.away.logo },
            startDate: fixture.fixture.date,
            competition: league || null,
            venue: fixture.fixture.venue,
            status: eventStatus(statusType),
            description: summary || undefined,
          }),
          breadcrumbLd([
            ...breadcrumbs.map(({ name, url }) => ({ name, url })),
            { name: matchName, url },
          ]),
        ])}
      />

      <div className="container mx-auto max-w-4xl px-4 pt-2 pb-3">
        <nav
          aria-label={tCommon("breadcrumb")}
          className="text-xs text-muted-foreground"
        >
          <ol className="flex flex-wrap items-center gap-x-1.5">
            {breadcrumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-x-1.5">
                <Link href={crumb.href} className="hover:underline">
                  {crumb.name}
                </Link>
                <span aria-hidden="true">›</span>
              </li>
            ))}
            <li aria-current="page" className="truncate text-foreground">
              {matchName}
            </li>
          </ol>
        </nav>

        <h1 className="mt-1 text-lg md:text-xl font-bold">{matchName}</h1>
        {summary && (
          <p className="text-sm text-muted-foreground">{summary}</p>
        )}

        {related.length > 0 && (
          <section aria-labelledby="game-related-articles" className="mt-2">
            <h2
              id="game-related-articles"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {t("relatedArticles")}
            </h2>
            <ul className="mt-1 space-y-1">
              {related.map(({ news, type }) => (
                <li
                  key={news.id}
                  className="flex items-baseline gap-2 text-sm"
                >
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${
                      type === "expert_perspective"
                        ? "bg-amber-500"
                        : "bg-primary"
                    }`}
                  >
                    {type === "expert_perspective"
                      ? t("readExpertPick")
                      : t("readPreview")}
                  </span>
                  <Link
                    href={articlePath(news)}
                    className="min-w-0 text-primary-font hover:underline"
                  >
                    {news.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <GameDetailClient
        fixtureId={fixtureId}
        initialFixture={fixture}
        initialFixtureUpdatedAt={Date.now()}
      />
    </>
  );
}
