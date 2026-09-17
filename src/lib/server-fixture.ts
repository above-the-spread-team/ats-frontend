import type {
  FixtureResponseItem,
  FixturesApiResponse,
} from "@/type/footballapi/fixture";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/fixtures";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

/**
 * Fixture by API-Football id, for server-rendered match pages. Same URL, header and
 * revalidate window as src/app/api/fixture-by-id/route.ts, so both share one Data Cache
 * entry — all locales and the client hook cost one upstream call per minute.
 *
 * `status`: 200 found · 404 no such fixture · 0/5xx upstream problem (don't 404 on those).
 */
export async function serverFetchFixture(
  fixtureId: number
): Promise<{ fixture: FixtureResponseItem | null; status: number }> {
  if (!API_KEY) return { fixture: null, status: 0 };

  try {
    const params = new URLSearchParams({ id: fixtureId.toString() });
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { fixture: null, status: response.status };

    const data = (await response.json()) as FixturesApiResponse;
    const fixture = data.response?.[0] ?? null;
    if (fixture) return { fixture, status: 200 };

    // An empty response with API errors (quota, bad key) is an outage, not a missing match.
    const hasErrors = Array.isArray(data.errors)
      ? data.errors.length > 0
      : Object.keys(data.errors ?? {}).length > 0;
    return { fixture: null, status: hasErrors ? 502 : 404 };
  } catch {
    return { fixture: null, status: 0 };
  }
}

export interface FixtureSitemapItem {
  fixture_id: number;
  home_team: string;
  away_team: string;
  league_name: string | null;
  match_date: string;
  status: string;
  updated_at: string;
}

/** Backend's rolling window of synced fixtures — the sitemap source (no API-Football quota). */
export async function serverFetchFixturesSitemap(): Promise<FixtureSitemapItem[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/fixtures/sitemap`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    return (await response.json()) as FixtureSitemapItem[];
  } catch {
    return [];
  }
}
