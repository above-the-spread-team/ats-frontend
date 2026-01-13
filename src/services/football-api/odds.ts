import { useQuery } from "@tanstack/react-query";
import type { OddsApiResponse } from "@/type/footballapi/odds";

/**
 * Fetch odds for a fixture
 */
async function fetchOdds(
  fixtureId: number,
  bookmaker?: number,
  bet?: number
): Promise<OddsApiResponse> {
  const params = new URLSearchParams({
    fixture: fixtureId.toString(),
  });

  if (bookmaker) {
    params.append("bookmaker", bookmaker.toString());
  }
  if (bet) {
    params.append("bet", bet.toString());
  }

  const response = await fetch(`/api/odds?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      typeof errorData.error === "string"
        ? errorData.error
        : "Failed to fetch odds"
    );
  }

  return response.json();
}

/**
 * React Query hook for fetching odds
 * @param fixtureId - The fixture ID
 * @param bookmaker - Optional bookmaker ID (default: 4)
 * @param bet - Optional bet type ID
 */
export function useOdds(
  fixtureId: number | null,
  bookmaker: number = 4,
  bet?: number
) {
  return useQuery<OddsApiResponse, Error>({
    queryKey: ["odds", fixtureId, bookmaker, bet],
    queryFn: () => fetchOdds(fixtureId!, bookmaker, bet),
    enabled: !!fixtureId && fixtureId > 0,
    staleTime: 3 * 60 * 60 * 1000, // 3 hours (matches API update frequency)
    refetchInterval: 3 * 60 * 60 * 1000, // Refetch every 3 hours
    refetchOnWindowFocus: false,
  });
}
