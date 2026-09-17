import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
  FixturesApiResponse,
  FixtureResponseItem,
} from "@/type/footballapi/fixture";
import { getFixtureStatus } from "@/data/fixture-status";

// Format date in a specific timezone (YYYY-MM-DD)
function formatDateParam(date: Date, timezone?: string): string {
  if (timezone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchFixturesByDate(
  dateStr: string,
  timezone: string,
): Promise<FixturesApiResponse> {
  const params = new URLSearchParams({
    date: dateStr,
    timezone,
  });
  const response = await fetch(`/api/fixture-by-date?${params.toString()}`, {
    cache: "default",
  });
  if (!response.ok) {
    throw new Error(`Failed to load fixtures (${response.status})`);
  }
  const data = (await response.json()) as FixturesApiResponse;
  if (data.errors && data.errors.length > 0) {
    console.warn("Fixture by date API errors:", data.errors);
  }
  return data;
}

async function fetchFixturesLive(): Promise<FixturesApiResponse> {
  const response = await fetch("/api/fixture-live", { cache: "default" });
  if (!response.ok) {
    throw new Error(`Failed to load live fixtures (${response.status})`);
  }
  const data = (await response.json()) as FixturesApiResponse;
  if (data.errors && data.errors.length > 0) {
    console.warn("Fixture live API errors:", data.errors);
  }
  return data;
}

export function useFixturesByDate(dateStr: string, timezone: string | null) {
  return useQuery({
    queryKey: ["fixtures-by-date", dateStr, timezone],
    queryFn: () => fetchFixturesByDate(dateStr, timezone!),
    enabled: !!dateStr && !!timezone,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFixturesLive(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["fixtures-live"],
    queryFn: fetchFixturesLive,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
  });
}

export function useFixtures(date: Date, timezone: string | null) {
  const dateStr = useMemo(
    () => formatDateParam(date, timezone ?? undefined),
    [date, timezone],
  );

  const {
    data: dateData,
    isLoading,
    error,
    ...rest
  } = useFixturesByDate(dateStr, timezone);

  const isToday = dateStr === formatDateParam(new Date(), timezone ?? undefined);
  const { data: liveData } = useFixturesLive({ enabled: isToday });

  const data = useMemo(() => {
    if (!dateData?.response) return undefined;
    let list = dateData.response;
    if (isToday && liveData?.response && liveData.response.length > 0) {
      const liveMap = new Map(liveData.response.map((f) => [f.fixture.id, f]));
      list = list.map((f) => liveMap.get(f.fixture.id) ?? f);
    }
    return {
      ...dateData,
      response: list,
      results: list.length,
    };
  }, [dateData, isToday, liveData]);

  return { data, isLoading, error, ...rest };
}

async function fetchFixture(fixtureId: number): Promise<FixturesApiResponse> {
  const response = await fetch(`/api/fixture-by-id?id=${fixtureId}`);

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

async function fetchFixturesNextLastSingle(
  type: "next" | "last",
  count: number,
  leagueId?: number,
  status?: string,
): Promise<FixturesApiResponse> {
  const params = new URLSearchParams();
  params.append(type, count.toString());
  if (leagueId) {
    params.append("league", leagueId.toString());
  }
  if (status) {
    params.append("status", status);
  }

  const response = await fetch(`/api/fixtures-next-last?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load fixtures (${response.status})`);
  }

  const data = (await response.json()) as FixturesApiResponse;

  if (data.errors && data.errors.length > 0) {
    console.warn("Fixtures API errors:", data.errors);
  }

  return data;
}

async function fetchFixturesNextLast(
  type: "next" | "last",
  count: number,
  leagueId?: number | readonly number[],
  status?: string,
): Promise<FixturesApiResponse> {
  const ids = Array.isArray(leagueId)
    ? leagueId
    : leagueId
      ? [leagueId as number]
      : [undefined];

  if (ids.length <= 1) {
    return fetchFixturesNextLastSingle(type, count, ids[0], status);
  }

  // Best-effort: a single failing league must not take down the whole section
  const settled = await Promise.allSettled(
    ids.map((id) => fetchFixturesNextLastSingle(type, count, id, status)),
  );
  const results = settled
    .filter(
      (r): r is PromiseFulfilledResult<FixturesApiResponse> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);

  if (results.length === 0) {
    throw new Error("Failed to load fixtures for all leagues");
  }

  const allFixtures = results.flatMap((r) => r.response ?? []);
  const sorted = allFixtures.sort(
    (a, b) =>
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime(),
  );

  // "last": keep the most recent `count` items (tail of ascending sort)
  // "next": keep the earliest `count` items (head of ascending sort)
  const sliced =
    type === "last" ? sorted.slice(-count) : sorted.slice(0, count);

  return {
    ...results[0],
    response: sliced,
    results: sliced.length,
  };
}

export function useFixturesNextLast(
  type: "next" | "last",
  count: number,
  leagueId?: number | readonly number[],
  status?: string,
) {
  const leagueKey = Array.isArray(leagueId) ? leagueId.join(",") : leagueId;
  return useQuery({
    queryKey: ["fixtures-next-last", type, count, leagueKey, status ?? null],
    queryFn: () => fetchFixturesNextLast(type, count, leagueId, status),
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

interface UseFixtureOptions {
  /**
   * Fixture already fetched on the server (match page SSR). A bare item is wrapped into
   * the API envelope so consumers keep reading `data.response[0]`.
   */
  initialData?: FixturesApiResponse | FixtureResponseItem;
  /**
   * When the server fetched it (ms epoch). Defaults to "now", i.e. fresh for one staleTime;
   * the status-based refetchInterval below still polls live matches either way.
   */
  initialDataUpdatedAt?: number;
}

function toFixturesApiResponse(
  data: FixturesApiResponse | FixtureResponseItem,
): FixturesApiResponse {
  if ("response" in data) return data;
  return {
    get: "fixtures",
    parameters: { id: data.fixture.id },
    errors: [],
    results: 1,
    paging: { current: 1, total: 1 },
    response: [data],
  };
}

export function useFixture(
  fixtureId: number | null,
  options?: UseFixtureOptions,
) {
  return useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: () => fetchFixture(fixtureId!),
    enabled: !!fixtureId,
    // Only seeds an empty cache entry — a fixture already in the cache wins.
    initialData: options?.initialData
      ? () => toFixturesApiResponse(options.initialData!)
      : undefined,
    initialDataUpdatedAt: options?.initialData
      ? options.initialDataUpdatedAt
      : undefined,
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
