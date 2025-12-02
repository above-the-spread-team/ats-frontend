import { useQuery } from "@tanstack/react-query";
import type { FixtureStatisticsApiResponse } from "@/type/fixture-statistics";

async function fetchFixtureStatistics(
  fixtureId: number
): Promise<FixtureStatisticsApiResponse> {
  const params = new URLSearchParams({
    fixture: fixtureId.toString(),
  });

  const response = await fetch(`/api/fixture-statistics?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load fixture statistics (${response.status})`);
  }

  const data = (await response.json()) as FixtureStatisticsApiResponse;

  if (data.errors && data.errors.length > 0) {
    console.warn("Fixture Statistics API errors:", data.errors);
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

export function useFixtureStatistics(
  fixtureId: number | null,
  statusType?: FixtureStatusType | null
) {
  return useQuery({
    queryKey: ["fixture-statistics", fixtureId],
    queryFn: () => fetchFixtureStatistics(fixtureId!),
    enabled: !!fixtureId,
    // Stale time: 60 seconds - matches backend revalidation
    staleTime: 60 * 1000,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refetchInterval: (_query) => {
      // Refetch intervals based on fixture status:
      // - In Play: every 60 seconds (live matches need frequent updates)
      // - Finished: every 10 minutes (data rarely changes after match ends)
      // - Scheduled: every 5 minutes (might get updates before kickoff, but less frequent)
      // - Other: every 2 minutes (default)
      if (statusType === "In Play") {
        return 60 * 1000; // 60 seconds for live matches
      } else if (statusType === "Finished") {
        return 100 * 60 * 1000; // 100 minutes for finished matches
      } else if (statusType === "Scheduled") {
        return 5 * 60 * 1000; // 5 minutes for scheduled matches
      } else {
        return 2 * 60 * 1000; // 2 minutes default
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
