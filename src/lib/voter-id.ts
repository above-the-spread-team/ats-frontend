const KEY = "voter_id";

/**
 * Returns the persistent anonymous voter UUID for this browser.
 * Generated once with crypto.randomUUID() and stored in localStorage.
 * Returns an empty string when called during SSR (no window).
 */
export function getVoterId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
