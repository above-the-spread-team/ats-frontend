import { useQuery } from "@tanstack/react-query";
import type { LineupsApiResponse } from "@/type/lineups";

async function fetchFixtureLineups(
  fixtureId: number
): Promise<LineupsApiResponse> {
  const params = new URLSearchParams({
    fixture: fixtureId.toString(),
  });

  const response = await fetch(`/api/lineups?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load fixture lineups (${response.status})`);
  }

  const data = (await response.json()) as LineupsApiResponse;

  if (data.errors && data.errors.length > 0) {
    console.warn("Fixture Lineups API errors:", data.errors);
  }

  return data;
}

type FixtureStatusType =
  | "Scheduled"
  | "In Play"
  | "Finished"
  | "Postponed"
  | "Cancelled"
  | "Abandoned"
  | "Not Played"
  | "Unknown";

export function useFixtureLineups(
  fixtureId: number | null,
  statusType?: FixtureStatusType | null
) {
  return useQuery({
    queryKey: ["fixture-lineups", fixtureId],
    queryFn: () => fetchFixtureLineups(fixtureId!),
    enabled: !!fixtureId,
    // Stale time: 20 minutes - matches In Play refetch interval
    staleTime: 20 * 60 * 1000,
    refetchInterval: (query) => {
      // Refetch intervals based on fixture status:
      // - In Play: every 20 minutes - matches API recommendation
      // - Finished: every 24 hours (1 day) - matches API recommendation
      // - Scheduled: every 10 minutes (might get updates before kickoff)
      // - Other: every 2 minutes (default)
      if (statusType === "In Play") {
        return 20 * 60 * 1000; // 20 minutes for live matches
      } else if (statusType === "Finished") {
        return 24 * 60 * 60 * 1000; // 24 hours (1 day) for finished matches
      } else if (statusType === "Scheduled") {
        return 10 * 60 * 1000; // 10 minutes for scheduled matches
      } else {
        return 20 * 60 * 1000; // 20 minutes default
      }
    },
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
    // Refetch on window focus for live matches only
    refetchOnWindowFocus: statusType === "In Play",
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  });
}
