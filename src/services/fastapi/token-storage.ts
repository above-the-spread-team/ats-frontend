/**
 * Token storage utility for Safari compatibility
 * Safari blocks SameSite=None cookies, so we store the token in sessionStorage
 * as a fallback when cookies don't work.
 */

const TOKEN_STORAGE_KEY = "auth_token";

/**
 * Store authentication token in sessionStorage (for Safari compatibility)
 * This is used when HttpOnly cookies are blocked by Safari
 */
export function storeToken(token: string): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.warn("Failed to store token in sessionStorage:", error);
    }
  }
}

/**
 * Get authentication token from sessionStorage
 * Returns null if not found or if running on server
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to get token from sessionStorage:", error);
    return null;
  }
}

/**
 * Remove authentication token from sessionStorage
 */
export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear token from sessionStorage:", error);
    }
  }
}

/**
 * Get authorization header value
 * Returns Bearer token if available in storage, otherwise null
 * The backend will fall back to cookies if no Authorization header is present
 */
export function getAuthHeader(): string | null {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : null;
}

