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
import { getAuthHeader } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Headers that always include Content-Type + Authorization when logged in. */
function baseHeaders(): HeadersInit {
  const auth = getAuthHeader();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = auth;
  return headers;
}

/** Headers for public read endpoints that accept optional auth.
 *  Sends Authorization only when a token exists; omits it entirely otherwise
 *  so the backend correctly treats the caller as anonymous. */
function optionalAuthHeaders(): HeadersInit {
  const auth = getAuthHeader();
  if (!auth) return { "Content-Type": "application/json" };
  return { "Content-Type": "application/json", Authorization: auth };
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
 * Submit or update a vote for a fixture. Requires authentication.
 */
export async function submitVote(
  payload: FixtureVoteCreate,
): Promise<FixtureVoteResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/votes`, {
    method: "POST",
    headers: baseHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse<FixtureVoteResponse>(res);
}

/**
 * GET /api/v1/votes/fixtures?date_offset={n}
 * Public endpoint. Returns fixtures + vote percentages for a given day.
 * date_offset: 0 = today, 1 = yesterday, … max 7.
 * Pass auth token (via optionalAuthHeaders) to receive user_vote field.
 */
export async function fetchFixtures(
  dateOffset: number = 0,
): Promise<FixtureVotesResult[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/votes/fixtures?date_offset=${dateOffset}`,
    { headers: optionalAuthHeaders(), credentials: "include" },
  );
  return handleResponse<FixtureVotesResult[]>(res);
}

/**
 * GET /api/v1/votes/available
 * Fully public endpoint — no auth required.
 * Returns ALL NS (Not Started) fixtures for today, regardless of the user's
 * votes. Users may browse and change their vote before kickoff.
 */
export async function fetchAvailableFixtures(): Promise<FixtureSummary[]> {
  const res = await fetch(`${BACKEND_URL}/api/v1/votes/available`);
  return handleResponse<FixtureSummary[]>(res);
}

/**
 * GET /api/v1/votes/:fixture_id
 * Public endpoint. Detailed voting results for a single fixture.
 * Pass auth token to receive user_vote field.
 */
export async function fetchFixtureVotes(
  fixtureId: number,
): Promise<FixtureVotesResult> {
  const res = await fetch(`${BACKEND_URL}/api/v1/votes/${fixtureId}`, {
    headers: optionalAuthHeaders(),
    credentials: "include",
  });
  return handleResponse<FixtureVotesResult>(res);
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

/**
 * Fixtures with vote percentages for a given day.
 * dateOffset 0 = today, 1 = yesterday, … max 7.
 * Public — no login required. Refetches every 60 s for live status updates.
 */
export function useFixtures(dateOffset: number = 0) {
  return useQuery<FixtureVotesResult[], VoteError>({
    queryKey: ["votes", "fixtures", dateOffset],
    queryFn: () => fetchFixtures(dateOffset),
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
 * All NS fixtures available for voting today.
 * Fully public — no auth sent, no user-based filtering.
 * Refetches on every mount so the list is always fresh.
 */
export function useAvailableFixtures() {
  return useQuery<FixtureSummary[], VoteError>({
    queryKey: ["votes", "available"],
    queryFn: fetchAvailableFixtures,
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
