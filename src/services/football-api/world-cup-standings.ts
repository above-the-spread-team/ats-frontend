import { useQuery } from "@tanstack/react-query";
import type { StandingsApiResponse } from "@/type/footballapi/standing";

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;

async function fetchWorldCupStandings(): Promise<StandingsApiResponse> {
  const params = new URLSearchParams({
    league: WORLD_CUP_LEAGUE_ID.toString(),
    season: WORLD_CUP_SEASON.toString(),
  });
  const response = await fetch(`/api/standings?${params.toString()}`, {
    cache: "default",
  });
  if (!response.ok) {
    throw new Error(`Failed to load standings (${response.status})`);
  }
  const data = (await response.json()) as StandingsApiResponse;
  if (data.errors && data.errors.length > 0) {
    console.warn("World Cup standings API errors:", data.errors);
  }
  return data;
}

export function useWorldCupStandings() {
  return useQuery({
    queryKey: ["world-cup-standings"],
    queryFn: fetchWorldCupStandings,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}
