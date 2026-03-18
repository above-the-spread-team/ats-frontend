import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SEASON_CONFIG } from "@/config/season-config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the browser's IANA timezone string, falling back to "UTC".
 * Guards against Safari low-power mode where Intl can fail to resolve.
 *
 * NOTE: Only call this on the client (inside useEffect / event handlers).
 * Use the `useUserTimezone` hook for SSR-safe access in components.
 */
export function getUserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz?.trim() ? tz : "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Returns the season year for a given league by looking it up in SEASON_CONFIG.
 * If the league is not found in any configured season, returns the most recent
 * season year in the config as a safe default.
 */
export function calculateSeason(leagueId?: number | string | null): number {
  if (leagueId != null) {
    const id =
      typeof leagueId === "string" ? parseInt(leagueId, 10) : leagueId;
    if (!Number.isNaN(id)) {
      for (const [seasonYear, ids] of Object.entries(SEASON_CONFIG)) {
        if (ids.includes(id)) {
          return parseInt(seasonYear, 10);
        }
      }
    }
  }

  // Default: the most recent season defined in the config
  const years = Object.keys(SEASON_CONFIG).map(Number);
  return Math.max(...years);
}
