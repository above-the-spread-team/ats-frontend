/**
 * Token storage utility for Safari compatibility
 * Safari blocks SameSite=None cookies, so we store the token in localStorage
 * as a fallback when cookies don't work.
 * localStorage persists across browser sessions, so login status is maintained
 */

const TOKEN_STORAGE_KEY = "auth_token";

/**
 * Store authentication token in localStorage (for Safari compatibility)
 * This is used when HttpOnly cookies are blocked by Safari
 * localStorage persists across browser sessions, so login status is maintained
 */
export function storeToken(token: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.warn("Failed to store token in localStorage:", error);
    }
  }
}

/**
 * Get authentication token from localStorage
 * Returns null if not found or if running on server
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to get token from localStorage:", error);
    return null;
  }
}

/**
 * Remove authentication token from localStorage
 */
export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear token from localStorage:", error);
    }
  }
}

/**
 * Get authorization header value
 * Returns Bearer token if available in storage, otherwise null
 * The backend will fall back to cookies if no Authorization header is present
 */
export function getAuthHeader(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

