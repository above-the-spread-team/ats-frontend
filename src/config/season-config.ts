/**
 * Single hand-edited league/season configuration for the frontend.
 *
 * KEEP IN SYNC — the SEASON_CONFIG literal must be identical with:
 *   ats-backend/app/core/leagues.py
 *   ats-news/app/services/league_constants.py
 */
export const SEASON_CONFIG: Record<number, readonly number[]> = {
  2026: [2, 3, 848, 39, 140, 135, 78, 61],
  2027: [98],
};

/** All tracked league ids, derived from SEASON_CONFIG (config order). */
export const LEAGUE_IDS: readonly number[] = Object.values(SEASON_CONFIG).flat();

/**
 * World Cup 2026 (finished July 2026). Not a tracked league and deliberately
 * not derived from SEASON_CONFIG — the legacy /world-cup pages pin these values.
 */
export const WORLD_CUP = { LEAGUE_ID: 1, SEASON: 2026 } as const;
