import { NextRequest, NextResponse } from "next/server";
import type { FixtureStatisticsApiResponse } from "@/type/fixture-statistics";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/fixtures/statistics";

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
  const type = req.nextUrl.searchParams.get("type");
  const half = req.nextUrl.searchParams.get("half");

  if (team) params.append("team", team);
  if (type) params.append("type", type);
  if (half) params.append("half", half);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      // Recommended: 1 call every minute for fixtures in progress, 1 call per day otherwise
      next: { revalidate: 60 }, // 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fixture Statistics API Error:", errorText);
      return NextResponse.json(
        {
          error: `Failed to fetch fixture statistics: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as FixtureStatisticsApiResponse;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fixture Statistics API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching fixture statistics",
      },
      { status: 500 }
    );
  }
}
