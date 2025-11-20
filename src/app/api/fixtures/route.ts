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

  // Check if fetching by ID
  const idParam = req.nextUrl.searchParams.get("id");
  if (idParam) {
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

      const response = await fetch(`${API_URL}?${params.toString()}`, {
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

      return NextResponse.json(data);
    } catch (error) {
      console.error("Fixture API Error:", error);
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

  const searchDate = req.nextUrl.searchParams.get("date");
  const timezone = req.nextUrl.searchParams.get("timezone") ?? DEFAULT_TIMEZONE;

  const parsedDate = searchDate ? new Date(searchDate) : new Date();
  const isValidDate = !Number.isNaN(parsedDate.getTime());
  const dateISO = isValidDate
    ? parsedDate.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  // Check if the requested date is today
  const todayISO = new Date().toISOString().split("T")[0];
  const isToday = dateISO === todayISO;

  // Use shorter revalidation for today (300s), longer for other dates (1 hour)
  const revalidateTime = isToday ? 300 : 7200;

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
      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          "x-apisports-key": API_KEY,
        },
        next: { revalidate: revalidateTime },
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

  return NextResponse.json({
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
  });
}
