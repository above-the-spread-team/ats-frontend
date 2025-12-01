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
  const leagueResults: Record<string, number> = {}; // Track fixtures per league for debugging

  // Fetch all leagues in parallel with better error handling
  const fetchPromises = LEAGUE_IDS.map(async (leagueId) => {
    const params = new URLSearchParams({
      date: dateISO,
      league: leagueId.toString(),
      season: season.toString(),
      timezone,
    });

    try {
      // Use 2 hours cache for all dates (fixture IDs don't change frequently)
      // But disable cache for the external API fetch to ensure fresh data
      const fetchOptions: RequestInit = {
        headers: {
          "x-apisports-key": API_KEY,
        },
        // Don't cache the external API request itself - only cache our response
        cache: "no-store",
      };

      const response = await fetchWithTimeout(
        `${API_URL}?${params.toString()}`,
        fetchOptions
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Fetch failed with status ${response.status} ${response.statusText}: ${errorText}`
        );
      }

      const data = (await response.json()) as FixturesApiResponse;

      // Check for API-level errors in the response
      if (data.errors && data.errors.length > 0) {
        throw new Error(`API errors: ${data.errors.join(", ")}`);
      }

      if (!data || !Array.isArray(data.response)) {
        throw new Error("Unexpected payload structure");
      }

      // Track how many fixtures we got from this league
      leagueResults[leagueId.toString()] = data.response.length;

      return data.response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors[leagueId.toString()] = errorMessage;
      // Log error for debugging (only in development or with proper logging)
      if (process.env.NODE_ENV === "development") {
        console.error(
          `Failed to fetch fixtures for league ${leagueId} on ${dateISO}:`,
          errorMessage
        );
      }
      return [];
    }
  });

  // Wait for all requests to complete
  const allResults = await Promise.all(fetchPromises);

  // Flatten all fixtures into a single array
  for (const leagueFixtures of allResults) {
    fixtures.push(...leagueFixtures);
  }

  const uniqueFixtures = Array.from(
    new Map(fixtures.map((fixture) => [fixture.fixture.id, fixture])).values()
  );

  const errorMessages = Object.entries(errors).map(
    ([leagueId, message]) => `League ${leagueId}: ${message}`
  );

  // Log summary for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `Fixtures fetch summary for ${dateISO}:`,
      `Total: ${uniqueFixtures.length},`,
      `Leagues with fixtures: ${Object.keys(leagueResults).length}/${
        LEAGUE_IDS.length
      },`,
      `Errors: ${errorMessages.length}`
    );
    if (Object.keys(leagueResults).length > 0) {
      console.log("Fixtures per league:", leagueResults);
    }
  }

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
      // Include debug info in development
      ...(process.env.NODE_ENV === "development" && {
        _debug: {
          leaguesWithFixtures: Object.keys(leagueResults).length,
          totalLeagues: LEAGUE_IDS.length,
          fixturesPerLeague: leagueResults,
        },
      }),
      paging: {
        current: 1,
        total: 1,
      },
      response: uniqueFixtures,
    },
    { headers }
  );
}
