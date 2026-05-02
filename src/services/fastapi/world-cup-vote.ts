import { backendFetch } from "@/lib/backend-fetch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  WorldCupGroupResponse,
  WorldCupTeamWithPercentage,
  WorldCupDeadlineResponse,
  WorldCupVoteCreate,
  WorldCupVoteUpdate,
  WorldCupVoteResponse,
  WorldCupVoteError,
} from "@/type/fastapi/world-cup-vote";
import { getAuthHeader } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const WC_SESSION_KEY = "wc_session";

// ---------------------------------------------------------------------------
// Session ID helpers (localStorage-based, Safari-safe)
// ---------------------------------------------------------------------------

function getWcSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(WC_SESSION_KEY);
  } catch {
    return null;
  }
}

function saveWcSessionId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WC_SESSION_KEY, id);
  } catch {
    // ignore
  }
}

export function clearWcSessionId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WC_SESSION_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders(includeJson = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  const auth = getAuthHeader();
  if (auth) headers["Authorization"] = auth;
  const sessionId = getWcSessionId();
  if (sessionId) headers["X-WC-Session"] = sessionId;
  return headers;
}

function authFetchInit(includeJson = false): RequestInit {
  return {
    headers: authHeaders(includeJson),
    credentials: "include",
  };
}

function captureWcSession(res: Response): void {
  const sessionId = res.headers.get("X-WC-Session");
  if (sessionId) saveWcSessionId(sessionId);
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

/** GET /api/v1/world-cup/groups — public */
export async function fetchWorldCupGroups(): Promise<WorldCupGroupResponse[]> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/world-cup/groups`);
  return handleResponse<WorldCupGroupResponse[]>(res);
}

/** GET /api/v1/world-cup/champions — public */
export async function fetchChampionPercentages(): Promise<
  WorldCupTeamWithPercentage[]
> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/world-cup/champions`);
  return handleResponse<WorldCupTeamWithPercentage[]>(res);
}

/** GET /api/v1/world-cup/deadline — optional auth */
export async function fetchDeadlineStatus(): Promise<WorldCupDeadlineResponse> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/world-cup/deadline`, {
    ...authFetchInit(),
  });
  return handleResponse<WorldCupDeadlineResponse>(res);
}

/** GET /api/v1/world-cup/vote/me — optional auth */
export async function fetchMyVote(): Promise<WorldCupVoteResponse> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/world-cup/vote/me`, {
    ...authFetchInit(),
  });
  return handleResponse<WorldCupVoteResponse>(res);
}

/** POST /api/v1/world-cup/vote — optional auth */
export async function submitVote(
  data: WorldCupVoteCreate,
): Promise<WorldCupVoteResponse> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/world-cup/vote`, {
    method: "POST",
    ...authFetchInit(true),
    body: JSON.stringify(data),
  });
  captureWcSession(res);
  const result = await handleResponse<WorldCupVoteResponse>(res);
  // Logged-in submission: backend merged the anonymous vote, clear stale session ID
  if (getAuthHeader()) clearWcSessionId();
  return result;
}

/** PUT /api/v1/world-cup/vote/me — optional auth */
export async function updateVote(
  data: WorldCupVoteUpdate,
): Promise<WorldCupVoteResponse> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/world-cup/vote/me`, {
    method: "PUT",
    ...authFetchInit(true),
    body: JSON.stringify(data),
  });
  captureWcSession(res);
  const result = await handleResponse<WorldCupVoteResponse>(res);
  if (getAuthHeader()) clearWcSessionId();
  return result;
}

/** DELETE /api/v1/world-cup/vote/me — optional auth */
export async function deleteMyVote(): Promise<void> {
  const res = await backendFetch(`${BACKEND_URL}/api/v1/world-cup/vote/me`, {
    method: "DELETE",
    ...authFetchInit(),
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    const detail =
      typeof body?.detail === "string" ? body.detail : `HTTP ${res.status}`;
    throw new Error(detail);
  }
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

export function useWorldCupGroups() {
  return useQuery<WorldCupGroupResponse[], WorldCupVoteError>({
    queryKey: ["world-cup", "groups"],
    queryFn: fetchWorldCupGroups,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useChampionPercentages() {
  return useQuery<WorldCupTeamWithPercentage[], WorldCupVoteError>({
    queryKey: ["world-cup", "champions"],
    queryFn: fetchChampionPercentages,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useWorldCupDeadline(enabled = true) {
  return useQuery<WorldCupDeadlineResponse, WorldCupVoteError>({
    queryKey: ["world-cup", "deadline"],
    queryFn: fetchDeadlineStatus,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    enabled,
  });
}

export function useMyVote(enabled = true) {
  return useQuery<WorldCupVoteResponse, WorldCupVoteError>({
    queryKey: ["world-cup", "vote", "me"],
    queryFn: fetchMyVote,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: false,
    enabled,
  });
}

export function useSubmitVote() {
  const queryClient = useQueryClient();
  return useMutation<WorldCupVoteResponse, Error, WorldCupVoteCreate>({
    mutationFn: submitVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world-cup", "vote"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "deadline"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "groups"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "champions"] });
    },
  });
}

export function useUpdateVote() {
  const queryClient = useQueryClient();
  return useMutation<WorldCupVoteResponse, Error, WorldCupVoteUpdate>({
    mutationFn: updateVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world-cup", "vote"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "deadline"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "groups"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "champions"] });
    },
  });
}

export function useDeleteVote() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: deleteMyVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world-cup", "vote"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "deadline"] });
    },
  });
}
