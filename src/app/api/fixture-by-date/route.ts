import { NextRequest, NextResponse } from "next/server";
import { LEAGUE_IDS } from "@/data/league-ids";
import type { FixturesApiResponse } from "@/type/footballapi/fixture";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";
const DEFAULT_TIMEZONE = "Europe/London";
const CACHE_SECONDS = 300; // 5 minutes

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/fixtures";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

const FETCH_TIMEOUT = 30000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
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

const TRACKED_LEAGUE_IDS = new Set<number>(LEAGUE_IDS);

/**
 * GET /api/fixture-by-date?date=2020-01-30&timezone=Europe/London
 * Single upstream call (fixtures?date=YYYY-MM-DD&timezone=…) returning the
 * whole day worldwide, filtered server-side to LEAGUE_IDS. Data cache is
 * bucketed per (date, timezone).
 * Cache: 5 minutes.
 */
export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing API key. Set API_SPORTS_KEY or FOOTBALL_API_KEY." },
      { status: 500 }
    );
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  const timezone =
    req.nextUrl.searchParams.get("timezone") ?? DEFAULT_TIMEZONE;

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json(
      { error: "Invalid or missing date. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({ date: dateParam, timezone });

  try {
    const response = await fetchWithTimeout(`${API_URL}?${params.toString()}`, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: CACHE_SECONDS },
    });
    if (!response.ok)
      throw new Error(`Fetch failed ${response.status} ${response.statusText}`);
    const data = (await response.json()) as FixturesApiResponse;
    if (!data || !Array.isArray(data.response))
      throw new Error("Unexpected payload structure");

    const filtered = data.response.filter((f) =>
      TRACKED_LEAGUE_IDS.has(f.league.id)
    );

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`
    );

    return NextResponse.json(
      {
        get: "fixtures",
        parameters: { date: dateParam, timezone, leagues: [...LEAGUE_IDS] },
        results: filtered.length,
        errors: [],
        paging: { current: 1, total: 1 },
        response: filtered,
      },
      { headers }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const headers = new Headers();
    // Don't let a transient upstream failure get CDN-cached for 5 minutes
    headers.set("Cache-Control", "no-store");
    return NextResponse.json(
      {
        get: "fixtures",
        parameters: { date: dateParam, timezone, leagues: [...LEAGUE_IDS] },
        results: 0,
        errors: [message],
        paging: { current: 1, total: 1 },
        response: [],
      },
      { headers }
    );
  }
}
