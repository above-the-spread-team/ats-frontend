import { NextRequest, NextResponse } from "next/server";
import type { LineupsApiResponse } from "@/type/footballapi/lineups";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/fixtures/lineups";

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

  // Get required fixture parameter
  const fixtureParam = req.nextUrl.searchParams.get("fixture");
  if (!fixtureParam) {
    return NextResponse.json(
      {
        error: "Missing required parameter: fixture",
      },
      { status: 400 }
    );
  }

  const fixtureId = parseInt(fixtureParam, 10);
  if (Number.isNaN(fixtureId)) {
    return NextResponse.json(
      {
        error: "Invalid fixture parameter. Must be a number.",
      },
      { status: 400 }
    );
  }

  // Build query parameters
  const params = new URLSearchParams({
    fixture: fixtureId.toString(),
  });

  // Optional parameters
  const team = req.nextUrl.searchParams.get("team");
  const player = req.nextUrl.searchParams.get("player");
  const type = req.nextUrl.searchParams.get("type");

  if (team) params.append("team", team);
  if (player) params.append("player", player);
  if (type) params.append("type", type);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      // Recommended: 1 call every 20 minutes for fixtures in progress, 1 call per day otherwise
      next: { revalidate: 1200 }, // 20 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lineups API Error:", errorText);
      return NextResponse.json(
        {
          error: `Failed to fetch lineups data: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as LineupsApiResponse;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Lineups API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching lineups data",
      },
      { status: 500 }
    );
  }
}
