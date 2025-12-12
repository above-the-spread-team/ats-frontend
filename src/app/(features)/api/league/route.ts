import { NextRequest, NextResponse } from "next/server";
import type { LeaguesApiResponse } from "@/type/footballapi/league";

const DEFAULT_API_URL = "https://v3.football.api-sports.io";

const API_URL =
  (process.env.FOOTBALL_API_URL ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_URL ||
    DEFAULT_API_URL) + "/leagues";

const API_KEY =
  process.env.API_SPORTS_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  "";

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

  // Get required id parameter
  const idParam = req.nextUrl.searchParams.get("id");
  if (!idParam) {
    return NextResponse.json(
      {
        error: "Missing required parameter: id",
      },
      { status: 400 }
    );
  }

  const leagueId = parseInt(idParam, 10);
  if (Number.isNaN(leagueId)) {
    return NextResponse.json(
      {
        error: "Invalid id parameter. Must be a number.",
      },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    id: leagueId.toString(),
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 3600 }, // 1 hour revalidation as recommended
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed with status ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as LeaguesApiResponse;

    if (!data || !Array.isArray(data.response)) {
      throw new Error("Unexpected payload structure");
    }

    // Return the first league from the response (since we're querying by id, there should be only one)
    return NextResponse.json({
      get: "leagues",
      parameters: {
        id: leagueId.toString(),
      },
      results: data.results,
      errors: data.errors || [],
      paging: data.paging,
      response: data.response[0] || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        get: "leagues",
        parameters: {
          id: leagueId.toString(),
        },
        results: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        paging: {
          current: 1,
          total: 1,
        },
        response: null,
      },
      { status: 500 }
    );
  }
}
