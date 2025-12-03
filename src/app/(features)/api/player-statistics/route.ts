import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const season = searchParams.get("season");

    // Validate required parameters
    if (!id) {
      return NextResponse.json(
        { error: "Player ID (id) is required" },
        { status: 400 }
      );
    }

    if (!season) {
      return NextResponse.json(
        { error: "Season is required" },
        { status: 400 }
      );
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.set("id", id);
    params.set("season", season);

    // Optional parameters
    const team = searchParams.get("team");
    const league = searchParams.get("league");
    const page = searchParams.get("page");

    if (team) params.set("team", team);
    if (league) params.set("league", league);
    if (page) params.set("page", page);

    // Fetch from API
    const response = await fetch(
      `${API_BASE_URL}/players?${params.toString()}`,
      {
        headers: {
          "x-apisports-key": API_KEY || "",
        },
        next: { revalidate: 86400 }, // 1 day revalidation as recommended
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch player statistics: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching player statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
