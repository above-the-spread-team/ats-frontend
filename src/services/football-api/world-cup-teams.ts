import { useQuery } from "@tanstack/react-query";
import type { TeamsApiResponse } from "@/type/footballapi/teams-info";

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;

async function fetchWorldCupTeams(): Promise<TeamsApiResponse> {
  const params = new URLSearchParams({
    league: WORLD_CUP_LEAGUE_ID.toString(),
    season: WORLD_CUP_SEASON.toString(),
  });
  const response = await fetch(`/api/teams-info?${params.toString()}`, {
    cache: "default",
  });
  if (!response.ok) {
    throw new Error(`Failed to load World Cup teams (${response.status})`);
  }
  const data = (await response.json()) as TeamsApiResponse;
  if (data.errors && data.errors.length > 0) {
    console.warn("World Cup teams API errors:", data.errors);
  }
  return data;
}

export function useWorldCupTeams() {
  return useQuery({
    queryKey: ["world-cup-teams"],
    queryFn: fetchWorldCupTeams,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours — squad rarely changes
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}
