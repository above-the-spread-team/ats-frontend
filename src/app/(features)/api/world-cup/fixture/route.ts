import { NextRequest, NextResponse } from "next/server";
import type { FixturesApiResponse } from "@/type/footballapi/fixture";

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;
const CACHE_SECONDS = 3600; // 1 hour

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    "https://v3.football.api-sports.io") + "/fixtures";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

/**
 * GET /api/world-cup/fixture?timezone=Europe/London
 * Fetches all FIFA World Cup 2026 fixtures (league=1, season=2026).
 * Cache: 1 hour.
 */
export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing API key. Set API_SPORTS_KEY or FOOTBALL_API_KEY." },
      { status: 500 }
    );
  }

  const timezone =
    req.nextUrl.searchParams.get("timezone") ?? "Europe/London";

  const params = new URLSearchParams({
    league: WORLD_CUP_LEAGUE_ID.toString(),
    season: WORLD_CUP_SEASON.toString(),
    timezone,
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as FixturesApiResponse;

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`
    );

    return NextResponse.json(data, { headers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
