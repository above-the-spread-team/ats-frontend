import { NextRequest, NextResponse } from "next/server";
import type { HeadToHeadApiResponse } from "@/type/headtohead";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/fixtures/headtohead";

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

  // Get team IDs - can be passed as h2h parameter or as separate team1 and team2
  const h2hParam = req.nextUrl.searchParams.get("h2h");
  const team1Param = req.nextUrl.searchParams.get("team1");
  const team2Param = req.nextUrl.searchParams.get("team2");

  let h2hValue: string | null = null;

  if (h2hParam) {
    // Use h2h parameter if provided
    h2hValue = h2hParam;
  } else if (team1Param && team2Param) {
    // Construct h2h from team1 and team2
    const team1 = parseInt(team1Param, 10);
    const team2 = parseInt(team2Param, 10);
    if (Number.isNaN(team1) || Number.isNaN(team2)) {
      return NextResponse.json(
        {
          error: "Invalid team1 or team2 parameter. Must be numbers.",
        },
        { status: 400 }
      );
    }
    h2hValue = `${team1}-${team2}`;
  } else {
    return NextResponse.json(
      {
        error:
          "Missing required parameter: h2h (format: teamId1-teamId2) or team1 and team2",
      },
      { status: 400 }
    );
  }

  // Validate h2h format
  const h2hMatch = h2hValue.match(/^(\d+)-(\d+)$/);
  if (!h2hMatch) {
    return NextResponse.json(
      {
        error: "Invalid h2h parameter format. Expected format: teamId1-teamId2",
      },
      { status: 400 }
    );
  }

  // Build query parameters
  const params = new URLSearchParams({
    h2h: h2hValue,
  });

  // Optional parameters
  const date = req.nextUrl.searchParams.get("date");
  const league = req.nextUrl.searchParams.get("league");
  const season = req.nextUrl.searchParams.get("season");
  const last = req.nextUrl.searchParams.get("last");
  const next = req.nextUrl.searchParams.get("next");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const status = req.nextUrl.searchParams.get("status");
  const venue = req.nextUrl.searchParams.get("venue");
  const timezone = req.nextUrl.searchParams.get("timezone");

  if (date) params.append("date", date);
  if (league) params.append("league", league);
  if (season) params.append("season", season);
  if (last) params.append("last", last);
  if (next) params.append("next", next);
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (status) params.append("status", status);
  if (venue) params.append("venue", venue);
  if (timezone) params.append("timezone", timezone);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      // Recommended: 1 call per minute for active fixtures, 1 call per day otherwise
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Head-to-Head API Error:", errorText);
      return NextResponse.json(
        {
          error: `Failed to fetch head-to-head data: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as HeadToHeadApiResponse;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Head-to-Head API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching head-to-head data",
      },
      { status: 500 }
    );
  }
}
