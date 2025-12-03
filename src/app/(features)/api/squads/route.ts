import { NextRequest, NextResponse } from "next/server";
import type { SquadsApiResponse } from "@/type/squads";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/players/squads";

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

  // Get team or player parameter (at least one is required)
  const teamParam = req.nextUrl.searchParams.get("team");
  const playerParam = req.nextUrl.searchParams.get("player");

  if (!teamParam && !playerParam) {
    return NextResponse.json(
      {
        error: "Missing required parameter: team or player",
      },
      { status: 400 }
    );
  }

  const params = new URLSearchParams();

  if (teamParam) {
    const teamId = parseInt(teamParam, 10);
    if (Number.isNaN(teamId)) {
      return NextResponse.json(
        {
          error: "Invalid team parameter. Must be a number.",
        },
        { status: 400 }
      );
    }
    params.append("team", teamId.toString());
  }

  if (playerParam) {
    const playerId = parseInt(playerParam, 10);
    if (Number.isNaN(playerId)) {
      return NextResponse.json(
        {
          error: "Invalid player parameter. Must be a number.",
        },
        { status: 400 }
      );
    }
    params.append("player", playerId.toString());
  }

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 604800 }, // 7 days revalidation (1 week as recommended)
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed with status ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as SquadsApiResponse;

    if (!data || !data.response) {
      throw new Error("Unexpected payload structure");
    }

    return NextResponse.json({
      get: "players/squads",
      parameters: {
        team: teamParam ? parseInt(teamParam, 10) : undefined,
        player: playerParam ? parseInt(playerParam, 10) : undefined,
      },
      results: data.results,
      errors: data.errors || [],
      paging: data.paging,
      response: data.response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        get: "players/squads",
        parameters: {
          team: teamParam ? parseInt(teamParam, 10) : undefined,
          player: playerParam ? parseInt(playerParam, 10) : undefined,
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
