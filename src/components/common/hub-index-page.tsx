import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FullPage from "@/components/common/full-page";
import type { HubType } from "@/components/common/hub-page";
import { hubPath } from "@/lib/hub-url";
import { JsonLd, breadcrumbLd, graphLd, itemListLd } from "@/lib/json-ld";
import { buildPageMetadata, localizedUrl } from "@/lib/seo";
import { serverFetchTagHubs } from "@/lib/server-tags";

const INDEX_PATH: Record<HubType, string> = {
  team: "/teams",
  league: "/leagues",
};

interface HubIndexParams {
  locale: string;
  hubType: HubType;
}

export async function buildHubIndexMetadata({
  locale,
  hubType,
}: HubIndexParams): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return buildPageMetadata({
    locale,
    path: INDEX_PATH[hubType],
    title: t(hubType === "team" ? "teamsIndexTitle" : "leaguesIndexTitle"),
    description: t(
      hubType === "team" ? "teamsIndexDescription" : "leaguesIndexDescription",
    ),
  });
}

/** /teams and /leagues: every hub of one type, busiest first. */
export default async function HubIndexPage({ locale, hubType }: HubIndexParams) {
  const t = await getTranslations({ locale, namespace: "hubs" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tArticles = await getTranslations({ locale, namespace: "articles" });

  const allHubs = await serverFetchTagHubs(locale === "en" ? undefined : locale);
  const hubs = allHubs
    .filter((hub) => hub.type === hubType)
    .map((hub) => ({
      id: hub.id,
      name: hub.translated_name ?? hub.name,
      path: hubPath(hub),
      newsCount: hub.news_count,
    }))
    .filter((hub): hub is typeof hub & { path: string } => Boolean(hub.path))
    .sort(
      (a, b) =>
        b.newsCount - a.newsCount || a.name.localeCompare(b.name, locale),
    );

  const indexPath = INDEX_PATH[hubType];
  const heading = t(hubType === "team" ? "allTeams" : "allLeagues");
  const pageUrl = localizedUrl(locale, indexPath);

  const structuredData = graphLd([
    breadcrumbLd([
      { name: tNav("home"), url: localizedUrl(locale, "/") },
      { name: t(hubType === "team" ? "teams" : "leagues"), url: pageUrl },
    ]),
    itemListLd(
      hubs.map((hub) => ({
        name: hub.name,
        url: localizedUrl(locale, hub.path),
      })),
    ),
  ]);

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
            <li aria-current="page" className="text-foreground">
              {t(hubType === "team" ? "teams" : "leagues")}
            </li>
          </ol>
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">{heading}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t(hubType === "team" ? "teamsIntro" : "leaguesIntro")}
          </p>
        </header>

        {hubs.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hubs.map((hub) => (
              <li key={hub.id}>
                <Link
                  href={hub.path}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all duration-200 hover:border-primary-font/30 hover:shadow-md"
                >
                  <span className="min-w-0 truncate font-semibold transition-colors group-hover:text-primary-font">
                    {hub.name}
                  </span>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {t("articleCount", { count: hub.newsCount })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FullPage>
  );
}
