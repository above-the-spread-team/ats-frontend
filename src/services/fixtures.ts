import { useQuery } from "@tanstack/react-query";
import type { FixturesApiResponse, FixtureResponseItem } from "@/type/fixture";
import { getFixtureStatus } from "@/data/fixture-status";

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

async function fetchFixture(fixtureId: number): Promise<FixturesApiResponse> {
  const response = await fetch(`/api/fixtures?id=${fixtureId}`);

  if (!response.ok) {
    throw new Error(`Failed to load fixture (${response.status})`);
  }

  const data = (await response.json()) as FixturesApiResponse;

  if (data.errors && data.errors.length > 0) {
    console.warn("Fixture API errors:", data.errors);
  }

  if (!data.response || data.response.length === 0) {
    throw new Error("Fixture not found");
  }

  return data;
}

export function useFixtures(date: Date, timezone: string) {
  // Check if the requested date is today
  const todayISO = new Date().toISOString().split("T")[0];
  const dateISO = formatDateParam(date);
  const isToday = dateISO === todayISO;

  // Stale time: how long data is considered fresh
  // - Today: 5 minutes (data changes frequently)
  // - Other dates: 1 hour (historical data doesn't change)
  const staleTime = isToday ? 5 * 60 * 1000 : 60 * 60 * 1000;

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

export function useFixture(fixtureId: number | null) {
  return useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: () => fetchFixture(fixtureId!),
    enabled: !!fixtureId,
    // Stale time: 30 seconds - matches In Play refetch interval
    // Data is considered fresh for 30 seconds, then refetchInterval handles background updates
    // For Finished/Scheduled fixtures, refetchInterval is longer but staleTime ensures
    // data is still considered fresh for quick navigation/refocus
    staleTime: 60 * 1000,
    refetchInterval: (query) => {
      // Get the fixture data to determine status
      const data = query.state.data;
      if (!data || !data.response || data.response.length === 0) {
        return 60 * 1000; // Default: refetch every minute if no data
      }

      const fixture: FixtureResponseItem = data.response[0];
      const statusShort = fixture.fixture.status.short;
      const statusInfo = getFixtureStatus(statusShort);
      const statusType = statusInfo.type;

      // Refetch intervals based on fixture status:
      // - In Play: every 30 seconds (live matches need frequent updates)
      // - Finished: every 30 minutes (data rarely changes after match ends)
      // - Scheduled: every 10 minutes (might get updates before kickoff, but less frequent)
      // - Other: every 1 minute (default)
      if (statusType === "In Play") {
        return 60 * 1000; // 60 seconds for live matches
      } else if (statusType === "Finished") {
        return 30 * 60 * 1000; // 30 minutes for finished matches
      } else if (statusType === "Scheduled") {
        return 10 * 60 * 1000; // 10 minutes for scheduled matches
      } else {
        return 60 * 1000; // 1 minute default
      }
    },
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
    // Refetch on window focus for live matches only
    refetchOnWindowFocus: (query) => {
      const data = query.state.data;
      if (!data || !data.response || data.response.length === 0) {
        return true;
      }
      const fixture: FixtureResponseItem = data.response[0];
      const statusInfo = getFixtureStatus(fixture.fixture.status.short);
      return statusInfo.type === "In Play";
    },
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  });
}
