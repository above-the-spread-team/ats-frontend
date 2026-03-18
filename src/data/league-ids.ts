import { SEASON_CONFIG } from "@/config/season-config";

export const LEAGUE_IDS = [1, 2, 3, 848, 39, 140, 135, 78, 61] as const;

/**
 * Returns true if the given league should display seasons as a single year
 * (e.g. "2026") rather than the regular "2025/2026" format.
 * Driven entirely by SEASON_CONFIG — no duplication needed here.
 */
export function isTournamentLeague(
  leagueId: number | string,
  season: number,
): boolean {
  const id = typeof leagueId === "string" ? parseInt(leagueId, 10) : leagueId;
  const ids = (SEASON_CONFIG as Record<number, number[]>)[season];
  return ids?.includes(id) ?? false;
}
