import { useQuery } from "@tanstack/react-query";
import type {
  UserPredictionStats,
  PredictionHistoryResponse,
  LeaderboardResponse,
  MonthlyWinnerResponse,
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
  const res = await fetch(`${BACKEND_URL}/api/v1/predictions/me`, authFetchInit());
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
  const res = await fetch(`${BACKEND_URL}/api/v1/predictions/users/${userId}`, authFetchInit());
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
