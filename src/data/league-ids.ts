export const LEAGUE_IDS = [
  2, 3, 848, 39, 140, 135, 78, 61, 239, 310, 14, 17, 18, 363, 391,
] as const;

export type LeagueId = (typeof LEAGUE_IDS)[number];
