import { useQuery } from "@tanstack/react-query";
import type { FixturesApiResponse } from "@/type/fixture";

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchFixtures(
  date: Date,
  timezone: string
): Promise<FixturesApiResponse> {
  const dateStr = formatDateParam(date);
  const response = await fetch(
    `/api/fixtures?date=${dateStr}&timezone=${encodeURIComponent(timezone)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load fixtures (${response.status})`);
  }

  const data = (await response.json()) as FixturesApiResponse;

  if (data.errors && data.errors.length > 0) {
    // Still return data even if there are errors, but we can handle them in the component
    console.warn("Fixture API errors:", data.errors);
  }

  return data;
}

export function useFixtures(date: Date, timezone: string) {
  // Check if the requested date is today
  const todayISO = new Date().toISOString().split("T")[0];
  const dateISO = formatDateParam(date);
  const isToday = dateISO === todayISO;

  // Stale time: how long data is considered fresh
  // - Today: 30 seconds (data changes frequently)
  // - Other dates: 1 hour (historical data doesn't change)
  const staleTime = isToday ? 30 * 1000 : 60 * 60 * 1000;

  // Refetch interval: how often to refetch in the background
  // - Today: every 5 minutes (300s) - matches API revalidation
  // - Other dates: every 2 hours (7200s) - matches API revalidation
  const refetchInterval = isToday ? 5 * 60 * 1000 : 2 * 60 * 60 * 1000;

  return useQuery({
    queryKey: ["fixtures", dateISO, timezone],
    queryFn: () => fetchFixtures(date, timezone),
    staleTime,
    refetchInterval,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
    // Refetch on window focus for today's fixtures
    refetchOnWindowFocus: isToday,
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  });
}
