import { useQuery } from "@tanstack/react-query";
import type { FixturesApiResponse } from "@/type/footballapi/fixture";

async function fetchWorldCupFixtures(
  timezone: string
): Promise<FixturesApiResponse> {
  const params = new URLSearchParams({ timezone });
  const response = await fetch(
    `/api/world-cup/fixture?${params.toString()}`,
    { cache: "default" }
  );
  if (!response.ok) {
    throw new Error(`Failed to load World Cup fixtures (${response.status})`);
  }
  const data = (await response.json()) as FixturesApiResponse;
  if (data.errors && data.errors.length > 0) {
    console.warn("World Cup fixtures API errors:", data.errors);
  }
  return data;
}

export function useWorldCupFixtures(timezone?: string) {
  const tz = timezone ?? "UTC";
  return useQuery({
    queryKey: ["world-cup-fixtures", tz],
    queryFn: () => fetchWorldCupFixtures(tz),
    staleTime: 60 * 60 * 1000, // 1 hour — schedule rarely changes
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}
