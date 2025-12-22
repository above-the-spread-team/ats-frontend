import { NextRequest, NextResponse } from "next/server";
import type { FixturesApiResponse } from "@/type/footballapi/fixture";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

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

  const nextParam = req.nextUrl.searchParams.get("next");
  const lastParam = req.nextUrl.searchParams.get("last");

  // Only one of next or last should be provided
  if (nextParam && lastParam) {
    return NextResponse.json(
      {
        error: "Cannot use both 'next' and 'last' parameters. Use only one.",
      },
      { status: 400 }
    );
  }

  const params = new URLSearchParams();

  if (nextParam) {
    const next = parseInt(nextParam, 10);
    if (Number.isNaN(next) || next < 1) {
      return NextResponse.json(
        {
          error: "Invalid 'next' parameter. Must be a positive number.",
        },
        { status: 400 }
      );
    }
    params.append("next", next.toString());
  } else if (lastParam) {
    const last = parseInt(lastParam, 10);
    if (Number.isNaN(last) || last < 1) {
      return NextResponse.json(
        {
          error: "Invalid 'last' parameter. Must be a positive number.",
        },
        { status: 400 }
      );
    }
    params.append("last", last.toString());
  } else {
    // Default to next=15 if neither is provided
    params.append("next", "15");
  }

  // Add league parameter if provided
  const leagueParam = req.nextUrl.searchParams.get("league");
  if (leagueParam) {
    const league = parseInt(leagueParam, 10);
    if (Number.isNaN(league) || league < 1) {
      return NextResponse.json(
        {
          error: "Invalid 'league' parameter. Must be a positive number.",
        },
        { status: 400 }
      );
    }
    params.append("league", league.toString());
  }

  // Use shorter cache for upcoming fixtures (1 hour)
  const revalidateTime = 3600;

  try {
    const fetchOptions: RequestInit = {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: {
        revalidate: revalidateTime,
      },
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

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `public, s-maxage=${revalidateTime}, stale-while-revalidate=${
        revalidateTime * 2
      }`
    );

    return NextResponse.json(data, { headers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
