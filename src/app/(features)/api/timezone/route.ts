import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/timezone";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

const FETCH_TIMEOUT = 15000;
const CACHE_SECONDS = 86400; // 24 hours – timezone list rarely changes

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

export interface TimezoneApiResponse {
  get: string;
  parameters: Record<string, never>;
  errors: string[] | Record<string, unknown>;
  results: number;
  paging: { current: number; total: number };
  response: string[];
}

/**
 * GET /api/timezone
 * Proxies Football API timezone list: https://v3.football.api-sports.io/timezone
 * Returns array of IANA timezone strings (e.g. "Africa/Abidjan", "Asia/Taipei").
 * Cache: 24 hours.
 */
export async function GET(_req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing API key. Set API_SPORTS_KEY or FOOTBALL_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const response = await fetchWithTimeout(API_URL, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as TimezoneApiResponse;

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`
    );

    return NextResponse.json(data, { headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Timezone request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
