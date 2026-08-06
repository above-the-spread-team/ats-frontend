import { NextRequest, NextResponse } from "next/server";
import type { FixtureEventsApiResponse } from "@/type/footballapi/fixture-events";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/fixtures/events";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

/** Next fetch cache + CDN response: 1 min fresh, 2 min SWR (see API-Sports rate guidance) */
const CACHE_SECONDS = 60;

/**
 * GET /api/fixture-events?fixture=…
 * Cache: 1 minute.
 */
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
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fixture Events API Error:", errorText);
      return NextResponse.json(
        {
          error: `Failed to fetch fixture events: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as FixtureEventsApiResponse;

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`
    );

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Fixture Events API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching fixture events",
      },
      { status: 500 }
    );
  }
}
