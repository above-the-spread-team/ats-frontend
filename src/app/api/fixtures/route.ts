import { NextRequest, NextResponse } from "next/server";
import { LEAGUE_IDS } from "@/data/league-ids";
import type { FixtureResponseItem, FixturesApiResponse } from "@/type/fixture";

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
    // Check for timeout/abort errors (can be AbortError or DOMException)
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
        error:
          "Missing API key. Please set API_SPORTS_KEY or FOOTBALL_API_KEY.",
      },
      { status: 500 }
    );
  }

  const searchDate = req.nextUrl.searchParams.get("date");
  const timezone = req.nextUrl.searchParams.get("timezone") ?? DEFAULT_TIMEZONE;

  // Get today's date in the specified timezone
  const getTodayInTimezone = (tz: string): string => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(now);
  };

  // If date is provided, use it directly (already in YYYY-MM-DD format)
  // If not provided, get today's date in the specified timezone
  const dateISO =
    searchDate && /^\d{4}-\d{2}-\d{2}$/.test(searchDate)
      ? searchDate
      : getTodayInTimezone(timezone);

  // Use 2 hours cache for all dates
  // For today and yesterday, this endpoint is used to get fixture IDs only (which don't change frequently)
  // Real-time data (scores, status, etc.) is fetched separately via fixtures-by-ids endpoint (60s cache)
  // This saves API costs by caching fixture IDs longer while still getting fresh real-time data
  const revalidateTime = 7200; // 2 hours for all dates

  const season = new Date(dateISO).getFullYear();

  const fixtures: FixtureResponseItem[] = [];
  const errors: Record<string, string> = {};

  for (const leagueId of LEAGUE_IDS) {
    const params = new URLSearchParams({
      date: dateISO,
      league: leagueId.toString(),
      season: season.toString(),
      timezone,
    });

    try {
      // Use 2 hours cache for all dates (fixture IDs don't change frequently)
      const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
        headers: {
          "x-apisports-key": API_KEY,
        },
        next: { revalidate: revalidateTime },
      };

      const response = await fetchWithTimeout(
        `${API_URL}?${params.toString()}`,
        fetchOptions
      );
      if (!response.ok) {
        throw new Error(
          `Fetch failed with status ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as FixturesApiResponse;

      if (!data || !Array.isArray(data.response)) {
        throw new Error("Unexpected payload structure");
      }

      for (const fixture of data.response) {
        fixtures.push(fixture);
      }
    } catch (error) {
      errors[leagueId.toString()] =
        error instanceof Error ? error.message : "Unknown error";
    }
  }

  const uniqueFixtures = Array.from(
    new Map(fixtures.map((fixture) => [fixture.fixture.id, fixture])).values()
  );

  const errorMessages = Object.entries(errors).map(
    ([leagueId, message]) => `League ${leagueId}: ${message}`
  );

  // Allow caching for all dates (2 hours)
  // For today and yesterday, this endpoint returns fixture IDs which don't change frequently
  // Real-time data is fetched separately via fixtures-by-ids endpoint
  const headers = new Headers();
  headers.set(
    "Cache-Control",
    `public, s-maxage=${revalidateTime}, stale-while-revalidate=${
      revalidateTime * 2
    }`
  );

  return NextResponse.json(
    {
      get: "fixtures",
      parameters: {
        date: dateISO,
        season,
        timezone,
        leagues: LEAGUE_IDS,
      },
      results: uniqueFixtures.length,
      errors: errorMessages,
      paging: {
        current: 1,
        total: 1,
      },
      response: uniqueFixtures,
    },
    { headers }
  );
}
