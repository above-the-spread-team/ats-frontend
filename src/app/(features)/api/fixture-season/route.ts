import { NextRequest, NextResponse } from "next/server";
import { gzipSync } from "zlib";
import { LEAGUE_IDS } from "@/data/league-ids";
import type {
  FixtureResponseItem,
  FixturesApiResponse,
} from "@/type/footballapi/fixture";

const VERCEL_RESPONSE_LIMIT_BYTES = 4 * 1024 * 1024; // 4 MB

const DEFAULT_API_URL = "https://v3.football.api-sports.io";
const DEFAULT_TIMEZONE = "Europe/London";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/fixtures";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

const FETCH_TIMEOUT = 30000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.name === "TimeoutError" ||
        error.message.includes("aborted") ||
        error.message.includes("timeout"))
    ) {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * GET /api/fixture-season?season=2024&timezone=Europe/London
 * Fetches all fixtures for all configured leagues for a season using
 * fixtures?league={id}&season={season}. No date or ids params.
 */
export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing API key. Set API_SPORTS_KEY or FOOTBALL_API_KEY." },
      { status: 500 }
    );
  }

  const seasonParam = req.nextUrl.searchParams.get("season");
  const timezone =
    req.nextUrl.searchParams.get("timezone") ?? DEFAULT_TIMEZONE;

  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : new Date().getFullYear();
  if (!Number.isFinite(season)) {
    return NextResponse.json(
      { error: "Invalid or missing season parameter." },
      { status: 400 }
    );
  }

  const fixtures: FixtureResponseItem[] = [];
  const errors: Record<string, string> = {};

  for (const leagueId of LEAGUE_IDS) {
    const params = new URLSearchParams({
      league: leagueId.toString(),
      season: season.toString(),
      timezone,
    });

    try {
      const response = await fetchWithTimeout(
        `${API_URL}?${params.toString()}`,
        {
          headers: { "x-apisports-key": API_KEY },
          next: { revalidate: 3600 },
        }
      );
      if (!response.ok) {
        throw new Error(`Fetch failed ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as FixturesApiResponse;
      if (!data || !Array.isArray(data.response)) {
        throw new Error("Unexpected payload structure");
      }

      for (const f of data.response) {
        fixtures.push(f);
      }
    } catch (error) {
      errors[leagueId.toString()] =
        error instanceof Error ? error.message : "Unknown error";
    }
  }

  const uniqueFixtures = Array.from(
    new Map(fixtures.map((f) => [f.fixture.id, f])).values()
  );
  const errorMessages = Object.entries(errors).map(
    ([id, msg]) => `League ${id}: ${msg}`
  );

  const body = {
    get: "fixtures",
    parameters: { season, timezone, leagues: [...LEAGUE_IDS] },
    results: uniqueFixtures.length,
    errors: errorMessages,
    paging: { current: 1, total: 1 },
    response: uniqueFixtures,
  };

  const json = JSON.stringify(body);
  const rawBytes = Buffer.byteLength(json, "utf8");
  const gzipBytes = gzipSync(Buffer.from(json, "utf8")).length;

  const headers = new Headers();
  headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=7200"
  );
  headers.set("X-Response-Size-Bytes", String(rawBytes));
  headers.set("X-Response-Size-Gzip-Bytes", String(gzipBytes));
  if (rawBytes > VERCEL_RESPONSE_LIMIT_BYTES) {
    headers.set(
      "X-Response-Size-Warning",
      `Raw size ${(rawBytes / 1024 / 1024).toFixed(2)} MB exceeds Vercel ~4 MB limit`
    );
  }

  return NextResponse.json(body, { headers });
}
