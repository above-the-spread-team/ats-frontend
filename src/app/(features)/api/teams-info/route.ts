import { NextRequest, NextResponse } from "next/server";
import type { TeamsApiResponse } from "@/type/footballapi/teams-info";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/teams";

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

  // Get required league parameter
  const leagueParam = req.nextUrl.searchParams.get("league");
  if (!leagueParam) {
    return NextResponse.json(
      {
        error: "Missing required parameter: league",
      },
      { status: 400 }
    );
  }

  const leagueId = parseInt(leagueParam, 10);
  if (Number.isNaN(leagueId)) {
    return NextResponse.json(
      {
        error: "Invalid league parameter. Must be a number.",
      },
      { status: 400 }
    );
  }

  // Get required season parameter
  const seasonParam = req.nextUrl.searchParams.get("season");
  if (!seasonParam) {
    return NextResponse.json(
      {
        error: "Missing required parameter: season",
      },
      { status: 400 }
    );
  }

  const season = parseInt(seasonParam, 10);
  if (Number.isNaN(season)) {
    return NextResponse.json(
      {
        error: "Invalid season parameter. Must be a number.",
      },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    league: leagueId.toString(),
    season: season.toString(),
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 86400 }, // 1 day revalidation as recommended
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed with status ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as TeamsApiResponse;

    if (!data || !Array.isArray(data.response)) {
      throw new Error("Unexpected payload structure");
    }

    return NextResponse.json({
      get: "teams",
      parameters: {
        league: leagueId,
        season,
      },
      results: data.results,
      errors: data.errors || [],
      paging: data.paging,
      response: data.response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        get: "teams",
        parameters: {
          league: leagueId,
          season,
        },
        results: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        paging: {
          current: 1,
          total: 1,
        },
        response: [],
      },
      { status: 500 }
    );
  }
}
