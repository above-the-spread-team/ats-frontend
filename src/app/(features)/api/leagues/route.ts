import { NextRequest, NextResponse } from "next/server";
import { LEAGUE_IDS } from "@/data/league-ids";
import type {
  LeaguesApiResponse,
  LeagueResponseItem,
} from "@/type/footballapi/league";

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
      { status: 500 },
    );
  }

  // Do not send season when listing all leagues: API returns each league with full "seasons" array.
  // Use GET leagues?id=X (no season) to get "all the seasons available for a league/cup".
  // Sequential fetching avoids bursting the football API rate limit (10 req/min on free plans).
  // The 4-hour revalidate means this loop only runs ~6 times per day per deployment.

  const fetchLeague = async (leagueId: number): Promise<LeagueResponseItem[]> => {
    const res = await fetch(
      `${API_URL}?${new URLSearchParams({ id: leagueId.toString() })}`,
      {
        headers: { "x-apisports-key": API_KEY },
        next: { revalidate: 14400 }, // 4 hours — league data changes very rarely
      },
    );
    if (!res.ok)
      throw new Error(`Fetch failed with status ${res.status} ${res.statusText}`);
    const data = (await res.json()) as LeaguesApiResponse;
    if (!data || !Array.isArray(data.response))
      throw new Error("Unexpected payload structure");
    // Empty response means the API rate-limited or had a transient issue — treat as retriable
    if (data.response.length === 0)
      throw new Error("empty response");
    return data.response;
  };

  const leagues: LeagueResponseItem[] = [];
  const errors: Record<string, string> = {};

  for (const leagueId of LEAGUE_IDS) {
    try {
      const items = await fetchLeague(leagueId);
      leagues.push(...items);
    } catch {
      // Retry once after a short pause — the empty response is usually a transient rate-limit blip
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const items = await fetchLeague(leagueId);
        leagues.push(...items);
      } catch (retryError) {
        errors[leagueId.toString()] =
          retryError instanceof Error ? retryError.message : "Unknown error";
      }
    }
  }

  const errorMessages = Object.entries(errors).map(
    ([leagueId, message]) => `League ${leagueId}: ${message}`,
  );

  return NextResponse.json({
    get: "leagues",
    parameters: {
      id: LEAGUE_IDS.join(","),
    },
    results: leagues.length,
    errors: errorMessages,
    paging: {
      current: 1,
      total: 1,
    },
    response: leagues,
  });
}
