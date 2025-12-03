import { NextRequest, NextResponse } from "next/server";
import type { StandingsApiResponse } from "@/type/standing";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/standings";

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

  // Get required season parameter, default to current year
  const seasonParam = req.nextUrl.searchParams.get("season");
  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : new Date().getFullYear();

  // Get optional team parameter
  const teamParam = req.nextUrl.searchParams.get("team");
  const teamId = teamParam ? parseInt(teamParam, 10) : null;

  const params = new URLSearchParams({
    league: leagueId.toString(),
    season: season.toString(),
  });

  // Add team parameter if provided
  if (teamId) {
    params.append("team", teamId.toString());
  }

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 3600 }, // 1 hour revalidation as recommended
    });
    if (!response.ok) {
      throw new Error(
        `Fetch failed with status ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as StandingsApiResponse;

    if (!data || !Array.isArray(data.response)) {
      throw new Error("Unexpected payload structure");
    }

    return NextResponse.json({
      get: "standings",
      parameters: {
        league: leagueId,
        season,
        team: teamId || undefined,
      },
      results: data.results,
      errors: data.errors || [],
      paging: data.paging,
      response: data.response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        get: "standings",
        parameters: {
          league: leagueId,
          season,
          team: teamId || undefined,
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
