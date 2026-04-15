import { useQuery } from "@tanstack/react-query";
import type {
  UserPredictionStats,
  PredictionHistoryResponse,
  LeaderboardResponse,
  MonthlyWinnerResponse,
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
 * GET /api/v1/leaderboard
 * Returns the top 10 predictors and the authenticated user's current rank.
 */
export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/leaderboard`,
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
 */
export function useLeaderboard() {
  return useQuery<LeaderboardResponse, PredictionError>({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
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
