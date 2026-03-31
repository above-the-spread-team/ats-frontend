import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { FixturesApiResponse } from "@/type/footballapi/fixture";
import { useFixturesLive } from "./fixtures";

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

  const { data: scheduleData, isLoading, error, ...rest } = useQuery({
    queryKey: ["world-cup-fixtures", tz],
    queryFn: () => fetchWorldCupFixtures(tz),
    staleTime: 60 * 60 * 1000, // 1 hour — schedule rarely changes
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const { data: liveData } = useFixturesLive();

  const data = useMemo(() => {
    if (!scheduleData?.response) return undefined;
    if (!liveData?.response || liveData.response.length === 0) return scheduleData;

    const liveMap = new Map(
      liveData.response.map((f) => [f.fixture.id, f])
    );
    const merged = scheduleData.response.map((f) => liveMap.get(f.fixture.id) ?? f);
    return { ...scheduleData, response: merged, results: merged.length };
  }, [scheduleData, liveData]);

  return { data, isLoading, error, ...rest };
}
