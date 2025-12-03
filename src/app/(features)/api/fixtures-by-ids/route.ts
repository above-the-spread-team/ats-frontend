import { NextRequest, NextResponse } from "next/server";
import type { FixtureResponseItem, FixturesApiResponse } from "@/type/fixture";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";
const DEFAULT_TIMEZONE = "Europe/London";
const MAX_IDS_PER_REQUEST = 20;

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

// Helper function to split array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
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

  // Get ids parameter (format: "id-id-id" or comma-separated)
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json(
      {
        error: "Missing required parameter: ids",
      },
      { status: 400 }
    );
  }

  // Parse IDs - support both dash-separated and comma-separated
  const idStrings = idsParam.split(/[-,]/).filter((id) => id.trim().length > 0);
  const fixtureIds: number[] = [];

  for (const idStr of idStrings) {
    const id = parseInt(idStr.trim(), 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: `Invalid fixture ID: ${idStr}. Must be a number.`,
        },
        { status: 400 }
      );
    }
    fixtureIds.push(id);
  }

  if (fixtureIds.length === 0) {
    return NextResponse.json(
      {
        error: "No valid fixture IDs provided",
      },
      { status: 400 }
    );
  }

  // Get timezone parameter
  const timezone = req.nextUrl.searchParams.get("timezone") ?? DEFAULT_TIMEZONE;

  // Split IDs into chunks of MAX_IDS_PER_REQUEST
  const idChunks = chunkArray(fixtureIds, MAX_IDS_PER_REQUEST);

  const fixtures: FixtureResponseItem[] = [];
  const errors: string[] = [];

  // Fetch fixtures in batches using for loop
  for (let i = 0; i < idChunks.length; i++) {
    const chunk = idChunks[i];
    const idsString = chunk.join("-");

    try {
      const params = new URLSearchParams({
        ids: idsString,
      });

      if (timezone) {
        params.append("timezone", timezone);
      }

      // Use 60 second revalidation for real-time fixture data
      // This endpoint is used to get live/real-time data for today's and yesterday's fixtures
      // Today's games will be in play, yesterday's games may also be in play (e.g., games starting at 11:30 PM)
      // 60s cache reduces API calls while keeping data fresh
      const response = await fetchWithTimeout(
        `${API_URL}?${params.toString()}`,
        {
          headers: {
            "x-apisports-key": API_KEY,
          },
          next: { revalidate: 60 }, // 60 seconds cache
        }
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

      // Add fixtures to the collection
      // Note: This endpoint returns fixtures with events, lineups, statistics, and players fixture data
      for (const fixture of data.response) {
        fixtures.push(fixture);
      }

      // Collect any errors from the API response
      if (data.errors && data.errors.length > 0) {
        errors.push(...data.errors);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Unknown error occurred while fetching fixtures batch ${i + 1}`;
      errors.push(`Batch ${i + 1} (IDs: ${idsString}): ${errorMessage}`);
    }
  }

  // Remove duplicates (in case same ID appears in multiple batches)
  const uniqueFixtures = Array.from(
    new Map(fixtures.map((fixture) => [fixture.fixture.id, fixture])).values()
  );

  // Use 60 second cache for real-time fixture data
  // This allows multiple users to share cached responses within 60s
  // Used for both today's and yesterday's fixtures
  // Today's games will be in play, yesterday's games may also be in play
  const headers = new Headers();
  headers.set(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=120"
  );

  return NextResponse.json(
    {
      get: "fixtures",
      parameters: {
        ids: fixtureIds.join("-"),
        timezone,
      },
      results: uniqueFixtures.length,
      errors: errors.length > 0 ? errors : [],
      paging: {
        current: 1,
        total: 1,
      },
      response: uniqueFixtures,
    },
    { headers }
  );
}
