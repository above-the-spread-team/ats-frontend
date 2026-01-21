import { NextRequest, NextResponse } from "next/server";
import { LEAGUE_IDS } from "@/data/league-ids";
import type {
  FixtureResponseItem,
  FixturesApiResponse,
} from "@/type/footballapi/fixture";

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

const FETCH_TIMEOUT = 15000;
const LIVE_CACHE_SECONDS = 180; // 3 minutes

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

/**
 * GET /api/fixture-live?live=all | live=39-140-135-78-61
 * Fetches fixtures currently in play. Events are included in the API response.
 * - live=all: every league
 * - live=id-id-id: our LEAGUE_IDS by default (2-3-848-39-140-135-78-61)
 * Cache: 3 minutes (live scores/status change often).
 */
export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing API key. Set API_SPORTS_KEY or FOOTBALL_API_KEY." },
      { status: 500 }
    );
  }

  const liveParam =
    req.nextUrl.searchParams.get("live") ?? LEAGUE_IDS.join("-");

  const url = `${API_URL}?live=${encodeURIComponent(liveParam)}`;

  try {
    const response = await fetchWithTimeout(url, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: LIVE_CACHE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as FixturesApiResponse;
    const list = Array.isArray(data?.response) ? data.response : [];
    const errors = data?.errors ?? [];

    if (errors.length > 0) {
      console.warn("Fixture live API errors:", errors);
    }

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `public, s-maxage=${LIVE_CACHE_SECONDS}, stale-while-revalidate=${LIVE_CACHE_SECONDS * 2}`
    );

    return NextResponse.json(
      {
        get: "fixtures",
        parameters: { live: liveParam },
        results: list.length,
        errors,
        paging: { current: 1, total: 1 },
        response: list as FixtureResponseItem[],
      },
      { headers }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Fixture live request failed";
    console.warn("Fixture live error:", message);
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `public, s-maxage=${LIVE_CACHE_SECONDS}, stale-while-revalidate=${LIVE_CACHE_SECONDS * 2}`
    );
    return NextResponse.json(
      {
        get: "fixtures",
        parameters: { live: liveParam },
        results: 0,
        errors: [message],
        paging: { current: 1, total: 1 },
        response: [],
      },
      { status: 200, headers }
    );
  }
}
