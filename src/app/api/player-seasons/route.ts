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
    const playerId = searchParams.get("player");

    // Build query parameters
    const params = new URLSearchParams();
    if (playerId) {
      params.set("player", playerId);
    }

    // Fetch from API
    const response = await fetch(
      `${API_BASE_URL}/players/seasons${params.toString() ? `?${params.toString()}` : ""}`,
      {
        headers: {
          "x-apisports-key": API_KEY || "",
        },
        next: { revalidate: 86400 }, // 1 day revalidation
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch player seasons: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching player seasons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
