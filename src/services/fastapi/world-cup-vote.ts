import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  WorldCupGroupResponse,
  WorldCupTeamWithPercentage,
  WorldCupDeadlineResponse,
  WorldCupPredictionCreate,
  WorldCupPredictionUpdate,
  WorldCupPredictionResponse,
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
  const res = await fetch(`${BACKEND_URL}/api/v1/world-cup/groups`);
  return handleResponse<WorldCupGroupResponse[]>(res);
}

/** GET /api/v1/world-cup/champions — public */
export async function fetchChampionPercentages(): Promise<
  WorldCupTeamWithPercentage[]
> {
  const res = await fetch(`${BACKEND_URL}/api/v1/world-cup/champions`);
  return handleResponse<WorldCupTeamWithPercentage[]>(res);
}

/** GET /api/v1/world-cup/deadline — requires auth */
export async function fetchDeadlineStatus(): Promise<WorldCupDeadlineResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/world-cup/deadline`, {
    ...authFetchInit(),
  });
  return handleResponse<WorldCupDeadlineResponse>(res);
}

/** GET /api/v1/world-cup/prediction/me — requires auth */
export async function fetchMyPrediction(): Promise<WorldCupPredictionResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/world-cup/prediction/me`, {
    ...authFetchInit(),
  });
  return handleResponse<WorldCupPredictionResponse>(res);
}

/** POST /api/v1/world-cup/prediction — requires auth */
export async function submitPrediction(
  data: WorldCupPredictionCreate,
): Promise<WorldCupPredictionResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/world-cup/prediction`, {
    method: "POST",
    ...authFetchInit(true),
    body: JSON.stringify(data),
  });
  captureWcSession(res);
  const result = await handleResponse<WorldCupPredictionResponse>(res);
  // Logged-in submission: backend merged the anonymous prediction, clear stale session ID
  if (getAuthHeader()) clearWcSessionId();
  return result;
}

/** PUT /api/v1/world-cup/prediction/me — requires auth */
export async function updatePrediction(
  data: WorldCupPredictionUpdate,
): Promise<WorldCupPredictionResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/world-cup/prediction/me`, {
    method: "PUT",
    ...authFetchInit(true),
    body: JSON.stringify(data),
  });
  captureWcSession(res);
  const result = await handleResponse<WorldCupPredictionResponse>(res);
  // Logged-in submission: backend merged the anonymous prediction, clear stale session ID
  if (getAuthHeader()) clearWcSessionId();
  return result;
}

/** DELETE /api/v1/world-cup/prediction/me — requires auth */
export async function deleteMyPrediction(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/v1/world-cup/prediction/me`, {
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

export function useMyPrediction(enabled = true) {
  return useQuery<WorldCupPredictionResponse, WorldCupVoteError>({
    queryKey: ["world-cup", "prediction", "me"],
    queryFn: fetchMyPrediction,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: false,
    enabled,
  });
}

export function useSubmitPrediction() {
  const queryClient = useQueryClient();
  return useMutation<
    WorldCupPredictionResponse,
    Error,
    WorldCupPredictionCreate
  >({
    mutationFn: submitPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world-cup", "prediction"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "deadline"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "groups"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "champions"] });
    },
  });
}

export function useUpdatePrediction() {
  const queryClient = useQueryClient();
  return useMutation<
    WorldCupPredictionResponse,
    Error,
    WorldCupPredictionUpdate
  >({
    mutationFn: updatePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world-cup", "prediction"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "deadline"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "groups"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "champions"] });
    },
  });
}

export function useDeletePrediction() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: deleteMyPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world-cup", "prediction"] });
      queryClient.invalidateQueries({ queryKey: ["world-cup", "deadline"] });
    },
  });
}
