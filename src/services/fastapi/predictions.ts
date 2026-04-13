import { useQuery } from "@tanstack/react-query";
import type {
  UserPredictionStats,
  PredictionHistoryResponse,
  LeaderboardResponse,
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
 * GET /api/v1/predictions/leaderboard
 * Returns the top 10 predictors and the authenticated user's current rank.
 */
export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/predictions/leaderboard`,
    authFetchInit(),
  );
  return handleResponse<LeaderboardResponse>(res);
}

/**
 * GET /api/v1/predictions/users/:userId
 * Returns prediction stats for any user (no auth required).
 */
export async function fetchUserStats(userId: number): Promise<UserPredictionStats> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/predictions/users/${userId}`,
    authFetchInit(),
  );
  return handleResponse<UserPredictionStats>(res);
}

/**
 * GET /api/v1/predictions/users/:userId/history?page=&page_size=
 * Returns paginated prediction history for any user (no auth required).
 */
export async function fetchUserHistory(
  userId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<PredictionHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const res = await fetch(
    `${BACKEND_URL}/api/v1/predictions/users/${userId}/history?${params.toString()}`,
    authFetchInit(),
  );
  return handleResponse<PredictionHistoryResponse>(res);
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
    queryKey: ["predictions", "leaderboard"],
    queryFn: fetchLeaderboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Prediction stats for any user by ID (no auth required).
 */
export function useUserStats(userId: number | null) {
  return useQuery<UserPredictionStats, PredictionError>({
    queryKey: ["predictions", "user", userId, "stats"],
    queryFn: () => fetchUserStats(userId!),
    enabled: userId !== null,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Paginated prediction history for any user by ID (no auth required).
 */
export function useUserHistory(
  userId: number | null,
  page: number = 1,
  pageSize: number = 20,
) {
  return useQuery<PredictionHistoryResponse, PredictionError>({
    queryKey: ["predictions", "user", userId, "history", page, pageSize],
    queryFn: () => fetchUserHistory(userId!, page, pageSize),
    enabled: userId !== null,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
