import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  VoteChoice,
  FixtureVoteCreate,
  FixtureVoteResponse,
  FixtureVotesResult,
  FixtureSummary,
  SyncFixturesResponse,
  VoteError,
} from "@/type/fastapi/vote";
import { getVoterId } from "@/lib/voter-id";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export type FixtureStatusFilter = "upcoming" | "in_play" | "finished";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns { "X-Voter-Id": "<uuid>" } when running in the browser.
 * Returns {} on the server (SSR) — all voting endpoints are client-side only.
 */
function voterIdHeader(): HeadersInit {
  const id = getVoterId();
  return id ? { "X-Voter-Id": id } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail =
      typeof body?.detail === "string" ? body.detail : `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/votes
 * Submit a one-time vote. Votes are final — cannot be changed after submission.
 * No login required — identity via X-Voter-Id UUID.
 * Throws with detail "Already voted" (409) if this voter already voted on the fixture.
 */
export async function submitVote(
  payload: FixtureVoteCreate,
): Promise<FixtureVoteResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...voterIdHeader() },
    body: JSON.stringify(payload),
  });
  return handleResponse<FixtureVoteResponse>(res);
}

/**
 * GET /api/v1/votes/fixtures?day=yesterday|today|tomorrow
 * Public. Returns fixtures + vote percentages for a given day.
 * UI translation:
 * -1 => tomorrow
 *  0 => today
 *  1+ => yesterday (backend supports yesterday/today/tomorrow)
 * Sends X-Voter-Id so user_vote is populated for the anonymous voter.
 */
export async function fetchFixtures(
  dateOffset: number = 0,
  statusFilters?: FixtureStatusFilter[],
): Promise<FixtureVotesResult[]> {
  // Backend contract now uses `day=yesterday|today|tomorrow`.
  // We keep the existing `dateOffset` UI API and translate:
  // -1 => tomorrow
  //  0 => today
  //  1+ => yesterday (backend only supports yesterday/today/tomorrow)
  const day: "yesterday" | "today" | "tomorrow" =
    dateOffset === -1 ? "tomorrow" : dateOffset === 0 ? "today" : "yesterday";

  const params = new URLSearchParams({ day });
  if (statusFilters && statusFilters.length > 0) {
    for (const status of statusFilters) params.append("status", status);
  }

  const res = await fetch(
    `${BACKEND_URL}/api/v1/votes/fixtures?${params.toString()}`,
    { headers: voterIdHeader() },
  );
  return handleResponse<FixtureVotesResult[]>(res);
}

/**
 * GET /api/v1/votes/available?day={today|tomorrow}
 * Public. Returns ALL NS fixtures for the target day.
 * Sending X-Voter-Id populates user_vote on already-voted fixtures so the
 * popup can show the voter's current pick and let them change it.
 */
export async function fetchAvailableFixtures(
  day: "today" | "tomorrow" = "today",
): Promise<FixtureSummary[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/votes/available?day=${day}`,
    { headers: voterIdHeader() },
  );
  return handleResponse<FixtureSummary[]>(res);
}

/**
 * GET /api/v1/votes/:fixture_id
 * Public. Detailed voting results for a single fixture.
 * Sends X-Voter-Id so user_vote is populated for the anonymous voter.
 */
export async function fetchFixtureVotes(
  fixtureId: number,
): Promise<FixtureVotesResult> {
  const res = await fetch(`${BACKEND_URL}/api/v1/votes/${fixtureId}`, {
    headers: voterIdHeader(),
  });
  return handleResponse<FixtureVotesResult>(res);
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

/**
 * Fixtures with vote percentages for a given day.
 * dateOffset UI contract:
 * -1 => tomorrow
 *  0 => today
 *  1+ => yesterday (backend supports yesterday/today/tomorrow)
 * Public — no login required. Refetches every 3 min for live status updates.
 */
export function useFixtures(
  dateOffset: number = 0,
  statusFilters?: FixtureStatusFilter[],
) {
  const normalizedStatusFilters = statusFilters
    ? [...statusFilters].sort().join(",")
    : undefined;

  return useQuery<FixtureVotesResult[], VoteError>({
    queryKey: ["votes", "fixtures", dateOffset, normalizedStatusFilters],
    queryFn: () =>
      fetchFixtures(
        dateOffset,
        normalizedStatusFilters
          ? (normalizedStatusFilters.split(
              ",",
            ) as FixtureStatusFilter[])
          : undefined,
      ),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** @deprecated Use useFixtures(0) instead. */
export function useTodayVotes() {
  return useFixtures(0);
}

/**
 * All NS fixtures for a given day (today or tomorrow).
 * Always sends X-Voter-Id so user_vote is populated on each fixture.
 * Already-voted fixtures are included — the popup uses user_vote to show
 * the voter's current pick and let them change it.
 */
export function useAvailableFixtures(day: "today" | "tomorrow" = "today") {
  return useQuery<FixtureSummary[], VoteError>({
    queryKey: ["votes", "available", day],
    queryFn: () => fetchAvailableFixtures(day),
    staleTime: 3 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Voting results for a single fixture. Public — no login required.
 */
export function useFixtureVotes(fixtureId: number | null) {
  return useQuery<FixtureVotesResult, VoteError>({
    queryKey: ["votes", "fixture", fixtureId],
    queryFn: () => fetchFixtureVotes(fixtureId!),
    enabled: fixtureId != null,
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Submit or update a vote.
 * Invalidates all fixtures queries and available fixtures on success.
 */
export function useSubmitVote() {
  const queryClient = useQueryClient();
  return useMutation<FixtureVoteResponse, Error, FixtureVoteCreate>({
    mutationFn: submitVote,
    onSuccess: (data) => {
      // Invalidate all date-offset variants of the fixtures results
      queryClient.invalidateQueries({ queryKey: ["votes", "fixtures"] });
      // Invalidate both day variants of the available fixtures list
      queryClient.invalidateQueries({ queryKey: ["votes", "available"] });
      queryClient.invalidateQueries({
        queryKey: ["votes", "fixture", data.fixture_id],
      });
    },
  });
}

/**
 * Convenience hook: submit a vote with a single `vote(fixtureId, choice)` call.
 */
export function useVote() {
  const mutation = useSubmitVote();
  return {
    ...mutation,
    vote: (fixtureId: number, choice: VoteChoice) =>
      mutation.mutateAsync({ fixture_id: fixtureId, vote_choice: choice }),
  };
}

// ---------------------------------------------------------------------------
// Admin / dev helper (manual fixture sync)
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/votes/sync
 * Manually trigger a fixture sync from API-Football.
 * Requires the FIXTURE_SECRET_KEY header — for dev/admin use only.
 */
export async function syncFixtures(
  secretKey: string,
): Promise<SyncFixturesResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/votes/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Fixture-Secret": secretKey,
    },
  });
  return handleResponse<SyncFixturesResponse>(res);
}
