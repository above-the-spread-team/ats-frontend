import { backendFetch } from "@/lib/backend-fetch";
import { useQuery } from "@tanstack/react-query";
import type {
  UserPredictionStats,
  PredictionHistoryResponse,
  LeaderboardResponse,
  MonthlyWinnerResponse,
  WorldCup2026WinnerResponse,
  LeaderboardTimeRange,
  PredictionError,
} from "@/type/fastapi/predictions";
import { getAuthHeader } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authFetchInit(): RequestInit {
  const headers: Record<string, string> = {};
  const auth = getAuthHeader();
  if (auth) headers["Authorization"] = auth;
  return { headers, credentials: "include" };
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
 * GET /api/v1/predictions/me
 * Returns the authenticated user's prediction accuracy, streaks, and community stats.
 */
export async function fetchMyStats(): Promise<UserPredictionStats> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/predictions/me`, authFetchInit());
  return handleResponse<UserPredictionStats>(res);
}

/**
 * GET /api/v1/predictions/me/history?page=&page_size=
 * Returns a paginated list of the authenticated user's resolved predictions.
 */
export async function fetchMyHistory(
  page: number = 1,
  pageSize: number = 20,
): Promise<PredictionHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const res = await fetch(
    `${BACKEND_URL}/api/v1/predictions/me/history?${params.toString()}`,
    authFetchInit(),
  );
  return handleResponse<PredictionHistoryResponse>(res);
}

/**
 * GET /api/v1/predictions/users/{userId}
 * Returns public prediction stats for any user by their ID.
 */
export async function fetchUserStats(userId: number): Promise<UserPredictionStats> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/predictions/users/${userId}`, authFetchInit());
  return handleResponse<UserPredictionStats>(res);
}

/**
 * GET /api/v1/leaderboard?time_range=
 * Returns the top 10 predictors and the authenticated user's current rank.
 * time_range: "overall" | "month" (default) | "last_month"
 */
export async function fetchLeaderboard(
  timeRange?: LeaderboardTimeRange,
): Promise<LeaderboardResponse> {
  const params = timeRange ? `?period=${timeRange}` : "";
  const res = await fetch(
    `${BACKEND_URL}/api/v1/leaderboard${params}`,
    authFetchInit(),
  );
  return handleResponse<LeaderboardResponse>(res);
}

/**
 * GET /api/v1/leaderboard/winners
 * Returns all past monthly #1 winners, most recent first.
 */
export async function fetchLeaderboardWinners(): Promise<MonthlyWinnerResponse[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/leaderboard/winners`,
    authFetchInit(),
  );
  return handleResponse<MonthlyWinnerResponse[]>(res);
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

/**
 * Authenticated user's prediction stats.
 */
export function useMyStats() {
  return useQuery<UserPredictionStats, PredictionError>({
    queryKey: ["predictions", "me", "stats"],
    queryFn: fetchMyStats,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Paginated prediction history for the authenticated user.
 */
export function useMyHistory(page: number = 1, pageSize: number = 20) {
  return useQuery<PredictionHistoryResponse, PredictionError>({
    queryKey: ["predictions", "me", "history", page, pageSize],
    queryFn: () => fetchMyHistory(page, pageSize),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Leaderboard with top 10 predictors and the authenticated user's rank.
 * Omit timeRange to get the default (current month) behaviour.
 */
export function useLeaderboard(timeRange?: LeaderboardTimeRange) {
  return useQuery<LeaderboardResponse, PredictionError>({
    queryKey: ["leaderboard", timeRange ?? "default"],
    queryFn: () => fetchLeaderboard(timeRange),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Public prediction stats for any user by ID.
 */
export function useUserStats(userId: number) {
  return useQuery<UserPredictionStats, PredictionError>({
    queryKey: ["predictions", "user", userId, "stats"],
    queryFn: () => fetchUserStats(userId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * All past monthly #1 winners, most recent first.
 */
export function useLeaderboardWinners() {
  return useQuery<MonthlyWinnerResponse[], PredictionError>({
    queryKey: ["leaderboard", "winners"],
    queryFn: fetchLeaderboardWinners,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ---------------------------------------------------------------------------
// World Cup 2026 leaderboard & prize winner
// TODO: remove this section after World Cup 2026 ends.
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/leaderboard?period=world_cup_2026
 * Live leaderboard for the World Cup 2026 window (Jun 11 – Jul 20, 2026 UTC).
 * Convenience wrapper around fetchLeaderboard — no auth required (user_entry
 * is populated when the caller is authenticated).
 */
export async function fetchWorldCupLeaderboard(): Promise<LeaderboardResponse> {
  return fetchLeaderboard("world_cup_2026");
}

/**
 * GET /api/v1/leaderboard/world-cup-2026/winner
 * Returns the captured prize winner after the tournament ends.
 * Throws with message "World Cup 2026 winner not yet captured" (HTTP 404)
 * until an admin calls POST /api/v1/leaderboard/world-cup-2026/capture.
 */
export async function fetchWorldCup2026Winner(): Promise<WorldCup2026WinnerResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/leaderboard/world-cup-2026/winner`,
    authFetchInit(),
  );
  return handleResponse<WorldCup2026WinnerResponse>(res);
}

/**
 * Live World Cup 2026 leaderboard (top 10 + authenticated user's entry).
 * Refreshes every 5 minutes — same cadence as other leaderboard hooks.
 * TODO: remove after World Cup 2026 ends.
 */
export function useWorldCupLeaderboard() {
  return useQuery<LeaderboardResponse, PredictionError>({
    queryKey: ["leaderboard", "world_cup_2026"],
    queryFn: fetchWorldCupLeaderboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Captured prize winner for the World Cup 2026 period.
 * Returns undefined while loading, null if the query errors (incl. 404 — not yet captured).
 * Poll `enabled` from the caller once the tournament is over.
 * TODO: remove after World Cup 2026 ends.
 */
export function useWorldCup2026Winner(enabled = true) {
  return useQuery<WorldCup2026WinnerResponse, PredictionError>({
    queryKey: ["leaderboard", "world-cup-2026", "winner"],
    queryFn: fetchWorldCup2026Winner,
    enabled,
    staleTime: Infinity,     // captured once by admin — never changes
    retry: false,            // 404 means not captured yet; don't hammer the endpoint
    refetchOnWindowFocus: false,
  });
}
