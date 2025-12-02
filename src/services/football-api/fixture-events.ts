import { useQuery } from "@tanstack/react-query";
import type { FixtureEventsApiResponse } from "@/type/fixture-events";

async function fetchFixtureEvents(
  fixtureId: number
): Promise<FixtureEventsApiResponse> {
  const params = new URLSearchParams({
    fixture: fixtureId.toString(),
  });

  const response = await fetch(`/api/fixture-events?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load fixture events (${response.status})`);
  }

  const data = (await response.json()) as FixtureEventsApiResponse;

  if (data.errors && data.errors.length > 0) {
    console.warn("Fixture Events API errors:", data.errors);
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

export function useFixtureEvents(
  fixtureId: number | null,
  statusType?: FixtureStatusType | null
) {
  return useQuery({
    queryKey: ["fixture-events", fixtureId],
    queryFn: () => fetchFixtureEvents(fixtureId!),
    enabled: !!fixtureId,
    // Stale time: 60 seconds - matches backend revalidation
    staleTime: 60 * 1000,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refetchInterval: (_query) => {
      // Refetch intervals based on fixture status:
      // - In Play: every 60 seconds (1 minute) - matches API recommendation
      // - Finished: every 24 hours (1 day) - matches API recommendation
      // - Scheduled: every 5 minutes (might get updates before kickoff)
      // - Other: every 2 minutes (default)
      if (statusType === "In Play") {
        return 60 * 1000; // 1 minute for live matches
      } else if (statusType === "Finished") {
        return 24 * 60 * 60 * 1000; // 24 hours (1 day) for finished matches
      } else if (statusType === "Scheduled") {
        return 10 * 60 * 1000; // 10 minutes for scheduled matches
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
