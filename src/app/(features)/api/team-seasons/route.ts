import { NextRequest, NextResponse } from "next/server";
import type { TeamSeasonsApiResponse } from "@/type/footballapi/team-seasons";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/teams/seasons";

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
      { status: 500 },
    );
  }

  const teamParam = req.nextUrl.searchParams.get("team");
  if (!teamParam) {
    return NextResponse.json(
      { error: "Missing required parameter: team" },
      { status: 400 },
    );
  }

  const teamId = parseInt(teamParam, 10);
  if (Number.isNaN(teamId)) {
    return NextResponse.json(
      { error: "Invalid team parameter. Must be a number." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ team: teamId.toString() });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed with status ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as TeamSeasonsApiResponse;

    if (!data || !Array.isArray(data.response)) {
      throw new Error("Unexpected payload structure");
    }

    return NextResponse.json({
      get: "teams/seasons",
      parameters: { team: teamParam },
      errors: data.errors ?? [],
      results: data.response.length,
      paging: data.paging ?? { current: 1, total: 1 },
      response: data.response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        get: "teams/seasons",
        parameters: { team: teamParam },
        results: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        paging: { current: 1, total: 1 },
        response: [],
      },
      { status: 500 },
    );
  }
}
