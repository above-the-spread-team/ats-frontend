import { serverFetchNewsById } from "@/lib/server-news";
import { OG_COLORS, OgFrame, loadImageDataUrl, ogResponse } from "@/lib/og-image";
import type { NewsResponse } from "@/type/fastapi/news";

/**
 * Social card for match previews / expert perspectives (they have no cover image):
 * both crests, the team names, the competition and the kick-off date. Always built from
 * the English article — the bundled font only covers Latin script.
 *
 * Lives under /og (not /api): robots.txt disallows /api/, which would block social crawlers.
 */
function TeamColumn({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 430,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 190,
          height: 190,
          borderRadius: 95,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img src={logo} width={130} height={130} style={{ objectFit: "contain" }} />
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: name.length > 18 ? 40 : 50,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {name}
      </div>
    </div>
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const newsId = /^\d+$/.test(id) ? Number.parseInt(id, 10) : NaN;
  const defaultCard = () =>
    Response.redirect(new URL("/og/default", request.url), 302);
  if (!Number.isSafeInteger(newsId) || newsId <= 0) return defaultCard();

  const { data } = await serverFetchNewsById(newsId);
  const news = data as NewsResponse | null;
  if (!news?.is_published || !news.home_team_name || !news.away_team_name) {
    return defaultCard();
  }

  const isExpert = news.article_type === "expert_perspective";
  const league = news.tags?.find((tag) => tag.type === "league")?.name;
  const kickoff = news.match_date
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(news.match_date))
    : null;

  const [homeLogo, awayLogo, siteLogo] = await Promise.all([
    loadImageDataUrl(news.home_team_logo),
    loadImageDataUrl(news.away_team_logo),
    loadImageDataUrl(new URL("/images/logo.png", request.url).toString()),
  ]);

  try {
    return ogResponse(
      <OgFrame
        label={isExpert ? "EXPERT PICK" : "MATCH PREVIEW"}
        labelColor={isExpert ? OG_COLORS.amber : OG_COLORS.blue}
        logo={siteLogo}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <TeamColumn name={news.home_team_name} logo={homeLogo} />
          <div style={{ display: "flex", fontSize: 44, color: OG_COLORS.muted, margin: "0 12px" }}>
            vs
          </div>
          <TeamColumn name={news.away_team_name} logo={awayLogo} />
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 30, color: OG_COLORS.muted }}>
          {[league, kickoff, isExpert ? news.expert_name : null]
            .filter(Boolean)
            .join("  ·  ")}
        </div>
      </OgFrame>,
    );
  } catch {
    return defaultCard();
  }
}
