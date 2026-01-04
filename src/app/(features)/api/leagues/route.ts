import { NextRequest, NextResponse } from "next/server";
import { LEAGUE_IDS } from "@/data/league-ids";
import type {
  LeaguesApiResponse,
  LeagueResponseItem,
} from "@/type/footballapi/league";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/leagues";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing API key. Please set API_SPORTS_KEY or FOOTBALL_API_KEY.",
      },
      { status: 500 }
    );
  }

  // Get optional season parameter
  const seasonParam = req.nextUrl.searchParams.get("season");

  // Calculate season based on current date if not provided
  // Football seasons typically run from August/September to May
  // If month is after May (June onwards), use current year as season
  // Otherwise (January to May), use previous year as season
  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
        return month > 5 ? year : year - 1;
      })();

  const leagues: LeagueResponseItem[] = [];
  const errors: Record<string, string> = {};

  for (const leagueId of LEAGUE_IDS) {
    const params = new URLSearchParams({
      id: leagueId.toString(),
      season: season.toString(),
    });

    try {
      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          "x-apisports-key": API_KEY,
        },
        next: { revalidate: 14400 }, // 4 hours revalidation for league data
      });

      if (!response.ok) {
        throw new Error(
          `Fetch failed with status ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as LeaguesApiResponse;

      if (!data || !Array.isArray(data.response)) {
        throw new Error("Unexpected payload structure");
      }

      // Add all leagues from the response (usually 1 per ID)
      for (const league of data.response) {
        leagues.push(league);
      }
    } catch (error) {
      errors[leagueId.toString()] =
        error instanceof Error ? error.message : "Unknown error";
    }
  }

  const errorMessages = Object.entries(errors).map(
    ([leagueId, message]) => `League ${leagueId}: ${message}`
  );

  return NextResponse.json({
    get: "leagues",
    parameters: {
      id: LEAGUE_IDS.join(","),
      season,
    },
    results: leagues.length,
    errors: errorMessages,
    paging: {
      current: 1,
      total: 1,
    },
    response: leagues,
  });
}
