import { NextRequest, NextResponse } from "next/server";
import type { OddsApiResponse } from "@/type/footballapi/odds";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";
const DEFAULT_TIMEZONE = "Europe/London";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/odds";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

// Timeout duration in milliseconds (30 seconds)
const FETCH_TIMEOUT = 30000;

// Helper function to add timeout to fetch requests
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.name === "TimeoutError" ||
        error.message.includes("aborted") ||
        error.message.includes("timeout"))
    ) {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      {
        error: "Missing API key. Please set API_SPORTS_KEY or FOOTBALL_API_KEY in .env",
      },
      { status: 500 }
    );
  }

  try {
    // Get query parameters
    const fixture = req.nextUrl.searchParams.get("fixture");
    const league = req.nextUrl.searchParams.get("league");
    const season = req.nextUrl.searchParams.get("season");
    const date = req.nextUrl.searchParams.get("date");
    const timezone = req.nextUrl.searchParams.get("timezone") ?? DEFAULT_TIMEZONE;
    const page = req.nextUrl.searchParams.get("page") || "1";
    const bookmaker = req.nextUrl.searchParams.get("bookmaker");
    const bet = req.nextUrl.searchParams.get("bet");

    // Build query parameters
    const params = new URLSearchParams({
      timezone,
      page,
    });

    if (fixture) params.append("fixture", fixture);
    if (league) params.append("league", league);
    if (season) params.append("season", season);
    if (date) params.append("date", date);
    if (bookmaker) params.append("bookmaker", bookmaker);
    if (bet) params.append("bet", bet);

    const url = `${API_URL}?${params.toString()}`;

    const response = await fetchWithTimeout(url, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 10800 }, // Cache for 3 hours (matches API update frequency)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Football API failed with status ${response.status}: ${errorText}`
      );
    }

    const data = (await response.json()) as OddsApiResponse;

    // Set cache headers
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, s-maxage=10800, stale-while-revalidate=21600"
    );

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Odds API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching odds",
      },
      { status: 500 }
    );
  }
}

