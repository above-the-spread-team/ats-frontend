import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link, permanentRedirect } from "@/i18n/navigation";
import FullPage from "@/components/common/full-page";
import { ArticleListView } from "@/app/[locale]/(features)/articles/components/article-list-view";
import { articlePath } from "@/lib/article-url";
import { hubPath, hubUrlSegment, parseHubId } from "@/lib/hub-url";
import { JsonLd, breadcrumbLd, graphLd, itemListLd } from "@/lib/json-ld";
import { buildPageMetadata, localizedUrl } from "@/lib/seo";
import { serverFetchNewsList } from "@/lib/server-news";
import { serverFetchTag } from "@/lib/server-tags";
import type { NewsListResponse } from "@/type/fastapi/news";

export type HubType = "team" | "league";

const HUB_PAGE_SIZE = 15;

const HUB_INDEX_PATH: Record<HubType, string> = {
  team: "/teams",
  league: "/leagues",
};

interface HubParams {
  locale: string;
  /** Raw `[slug]` route param: "{slug}-{tagId}" or a bare "{tagId}" */
  slugParam: string;
  hubType: HubType;
  page: number;
}

/** `?page=` as a positive integer; anything else (missing, junk, 0) is page 1. */
export function parseHubPageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 1;
  const page = Number.parseInt(raw, 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function backendLang(locale: string): string | undefined {
  return locale === "en" ? undefined : locale;
}

export async function buildHubMetadata({
  locale,
  slugParam,
  hubType,
  page,
}: HubParams): Promise<Metadata> {
  const tagId = parseHubId(slugParam);
  if (tagId === null) return { title: "Not Found" };

  const { data: tag } = await serverFetchTag(tagId, backendLang(locale));
  const path = tag ? hubPath(tag) : undefined;
  if (!tag || tag.type !== hubType || !path) return { title: "Not Found" };

  const t = await getTranslations({ locale, namespace: "metadata" });
  const name = tag.translated_name ?? tag.name;

  // Every page of a hub canonicalises to page 1; deeper pages stay out of the index but
  // keep `follow`, so the articles they link to are still crawled.
  return buildPageMetadata({
    locale,
    path,
    title: t(hubType === "team" ? "teamHubTitle" : "leagueHubTitle", { name }),
    description: t(
      hubType === "team" ? "teamHubDescription" : "leagueHubDescription",
      { name },
    ),
    noindex: page > 1,
  });
}

export default async function HubPage({
  locale,
  slugParam,
  hubType,
  page,
}: HubParams) {
  const tagId = parseHubId(slugParam);
  if (tagId === null) notFound();

  const lang = backendLang(locale);
  const { data: tag, status: tagStatus } = await serverFetchTag(tagId, lang);

  // A missing tag is a real 404; a backend outage must surface as a 5xx (error boundary),
  // never as a "not found" page that would get the hub de-indexed.
  if (tagStatus === 404) notFound();
  if (!tag) throw new Error(`Failed to load tag ${tagId} (status ${tagStatus})`);

  const canonicalPath = hubPath(tag);
  if (tag.type !== hubType || !canonicalPath) notFound();

  // Bare-id and stale-slug URLs permanently redirect to the canonical slug URL
  if (slugParam !== hubUrlSegment(tag)) {
    permanentRedirect({
      href: page > 1 ? `${canonicalPath}?page=${page}` : canonicalPath,
      locale,
    });
  }

  const { data: listData, status: listStatus } = await serverFetchNewsList(
    page,
    HUB_PAGE_SIZE,
    lang,
    undefined,
    [tag.id],
  );
  const list = listData as NewsListResponse | null;
  if (!list) {
    throw new Error(
      `Failed to load articles of tag ${tag.id} (status ${listStatus})`,
    );
  }

  const articles = list.items;
  // Past the last page (page 1 of an empty hub still renders its empty state)
  if (page > 1 && articles.length === 0) notFound();

  const t = await getTranslations({ locale, namespace: "hubs" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tArticles = await getTranslations({ locale, namespace: "articles" });

  const name = tag.translated_name ?? tag.name;
  const indexPath = HUB_INDEX_PATH[hubType];
  const indexLabel = t(hubType === "team" ? "teams" : "leagues");
  const pageUrl = localizedUrl(locale, canonicalPath);
  const totalPages = Math.max(list.total_pages, 1);
  const pageHref = (target: number) =>
    target > 1 ? `${canonicalPath}?page=${target}` : canonicalPath;

  const structuredData = graphLd([
    breadcrumbLd([
      { name: tNav("home"), url: localizedUrl(locale, "/") },
      { name: indexLabel, url: localizedUrl(locale, indexPath) },
      { name, url: pageUrl },
    ]),
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#collection`,
      name,
      url: pageUrl,
      inLanguage: locale,
    },
    itemListLd(
      articles.map((article) => ({
        name: article.title,
        url: localizedUrl(locale, articlePath(article)),
      })),
    ),
  ]);

  const pagerLinkClass =
    "rounded-full border border-border bg-card px-4 py-1.5 font-medium transition hover:border-primary-font/30 hover:text-primary-font";
  const pagerDisabledClass =
    "rounded-full border border-border px-4 py-1.5 font-medium opacity-50";

  return (
    <FullPage>
      <JsonLd data={structuredData} />
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 mb-8">
        <nav
          aria-label={tArticles("breadcrumb.label")}
          className="text-xs text-muted-foreground"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:underline">
                {tNav("home")}
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href={indexPath} className="hover:underline">
                {indexLabel}
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-foreground">
              {name}
            </li>
          </ol>
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t(hubType === "team" ? "teamIntro" : "leagueIntro", { name })}
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{t("latestArticles")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("articleCount", { count: list.total })}
            </p>
          </div>

          {articles.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            // Grid only: without onPageChange the client component renders no pagination
            <ArticleListView
              articles={articles}
              data={undefined}
              page={page}
              isLoading={false}
              error={null}
              emptyMessage={t("empty")}
              emptyHelpText=""
              locale={locale}
            />
          )}

          {totalPages > 1 && (
            <nav
              aria-label={t("pagination")}
              className="flex items-center justify-center gap-3 pt-2 text-sm"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  rel="prev"
                  className={pagerLinkClass}
                >
                  {t("previous")}
                </Link>
              ) : (
                <span aria-disabled="true" className={pagerDisabledClass}>
                  {t("previous")}
                </span>
              )}
              <span className="text-muted-foreground">
                {t("pageOf", { page, total: totalPages })}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  rel="next"
                  className={pagerLinkClass}
                >
                  {t("next")}
                </Link>
              ) : (
                <span aria-disabled="true" className={pagerDisabledClass}>
                  {t("next")}
                </span>
              )}
            </nav>
          )}
        </section>
      </div>
    </FullPage>
  );
}
