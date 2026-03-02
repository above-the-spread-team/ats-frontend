import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, AuthError } from "@/type/fastapi/user";
import { getAuthHeader, clearStoredToken } from "./token-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Note: We use HttpOnly cookies set by the backend for security.
 * HttpOnly cookies cannot be read by JavaScript, so we don't store tokens
 * in localStorage. Authentication is checked via API calls.
 */

/**
 * Check if user is authenticated by attempting to fetch user data
 * Since HttpOnly cookies can't be read by JavaScript, we check auth status
 * by making a lightweight API call or checking React Query cache
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    // Get auth header for Safari compatibility (falls back to cookies if not available)
    const authHeader = getAuthHeader();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include", // Include HttpOnly cookies (for non-Safari browsers)
      headers,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Synchronous check for authentication status
 * Since HttpOnly cookies can't be read by JavaScript, this is an optimistic check
 * For accurate status, components should use useCurrentUser() hook
 * This function is kept for backward compatibility but always returns true
 * Actual authentication is checked via API calls
 */
export function isAuthenticated(): boolean {
  // Since HttpOnly cookies can't be read, we can't check synchronously
  // Components should use useCurrentUser() hook which handles this properly
  // This returns true optimistically - actual check happens via API
  return true;
}

/**
 * Initiate Google OAuth login
 * Redirects to backend which then redirects to Google
 */
export function initiateGoogleLogin(): void {
  window.location.href = `${BACKEND_URL}/api/auth/google/login`;
}

/**
 * Get current authenticated user
 * Backend reads token from HttpOnly cookie or Authorization header
 * For Safari compatibility, we send token in Authorization header if available
 * Backend falls back to cookies if no Authorization header is present
 */
export async function getCurrentUser(): Promise<User> {
  // Get auth header for Safari compatibility (falls back to cookies if not available)
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: "GET",
    headers,
    credentials: "include", // Sends HttpOnly cookie automatically (for non-Safari browsers)
  });

  if (!response.ok) {
    // If 401, throw a specific error that includes status code
    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    const error: AuthError = await response.json().catch(() => ({
      detail: "Failed to get user information",
    }));
    throw new Error(error.detail || "Failed to get user information");
  }

  const user: User = await response.json();
  return user;
}

/**
 * Logout user
 * Backend clears the HttpOnly cookie on logout
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include", // Include HttpOnly cookie
    });

    if (!response.ok) {
      console.warn(
        "Logout response not OK:",
        response.status,
        response.statusText
      );
    }

    // Verify cookie was cleared by checking /me endpoint
    // This helps debug if cookie deletion worked
    // Note: We don't include Authorization header here since we're testing logout
    const verifyResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (verifyResponse.ok) {
      console.warn(
        "Warning: Cookie may not have been cleared. /api/auth/me still returns 200"
      );
    } else {
      console.log(
        "Cookie cleared successfully. /api/auth/me returns",
        verifyResponse.status
      );
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear stored token (for Safari compatibility)
    clearStoredToken();

    // Dispatch custom event to notify components of logout
    // Backend clears the HttpOnly cookie, so no localStorage cleanup needed
    window.dispatchEvent(new Event("logout"));
  }
}

/**
 * React Query hook to get current authenticated user
 * Since we use HttpOnly cookies, we always attempt to fetch
 * The backend will return 401 if not authenticated
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: options?.enabled !== false, // Default to true, but can be disabled
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) - user is not authenticated
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("Not authenticated"))
      ) {
        return false;
      }
      return failureCount < 1; // Retry once for other errors
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    // When query fails with 401, clear the data immediately
    // This ensures UI updates immediately after logout
    throwOnError: false, // Don't throw, just return error state
    // Refetch on window focus to catch logout from other tabs
    refetchOnWindowFocus: true,
    // Ensure query refetches when invalidated (even if staleTime hasn't passed)
    refetchOnMount: true,
  });
}

/**
 * React Query mutation hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Cancel any ongoing queries first
      queryClient.cancelQueries({ queryKey: ["currentUser"] });

      // Reset query state completely - this clears data and resets status
      // This ensures components see the change immediately
      queryClient.resetQueries({
        queryKey: ["currentUser"],
        exact: true,
      });

      // Set data to undefined to ensure UI updates
      queryClient.setQueryData(["currentUser"], undefined);

      // Invalidate to mark as stale and trigger refetch
      // The refetch will get 401 and properly update the error state
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
        refetchType: "active",
      });

      // Clear user-specific data so sidebar and other components don't show
      // the previous user's groups after account switch / logout
      queryClient.removeQueries({ queryKey: ["userGroups"] });
    },
  });
}
