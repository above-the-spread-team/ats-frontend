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

  // Get id parameter
  const idParam = req.nextUrl.searchParams.get("id");
  if (!idParam) {
    return NextResponse.json(
      {
        error: "Missing required parameter: id",
      },
      { status: 400 }
    );
  }

  const fixtureId = parseInt(idParam, 10);
  if (Number.isNaN(fixtureId)) {
    return NextResponse.json(
      {
        error: "Invalid id parameter. Must be a number.",
      },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      id: fixtureId.toString(),
    });

    const response = await fetchWithTimeout(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 60 }, // 1 minute revalidation for live fixtures
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed with status ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as FixturesApiResponse;

    if (!data || !Array.isArray(data.response)) {
      throw new Error("Unexpected payload structure");
    }

    // Prevent caching for single fixture requests (usually live fixtures)
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Fixture by ID API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching fixture",
      },
      { status: 500 }
    );
  }
}
