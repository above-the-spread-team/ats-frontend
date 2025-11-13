export const LEAGUE_IDS = [2, 3, 848, 39, 140, 135, 78, 61, 141, 90] as const;

export type LeagueId = (typeof LEAGUE_IDS)[number];
