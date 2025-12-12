import { NextRequest, NextResponse } from "next/server";
import type { FixturesApiResponse } from "@/type/footballapi/fixture";

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

  try {
    const timezone =
      req.nextUrl.searchParams.get("timezone") ?? DEFAULT_TIMEZONE;

    const params = new URLSearchParams({
      live: "all",
      timezone,
    });

    // Live fixtures are updated every 15 seconds, so use shorter revalidation
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 15 }, // 15 seconds revalidation for live fixtures
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed with status ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as FixturesApiResponse;

    if (!data || !Array.isArray(data.response)) {
      throw new Error("Unexpected payload structure");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Live Fixtures API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching live fixtures",
      },
      { status: 500 }
    );
  }
}
