export interface LeagueCoverageFixtures {
  events: boolean;
  lineups: boolean;
  statistics_fixtures: boolean;
  statistics_players: boolean;
}

export interface LeagueCoverage {
  fixtures: LeagueCoverageFixtures;
  standings: boolean;
  players: boolean;
  top_scorers: boolean;
  top_assists: boolean;
  top_cards: boolean;
  injuries: boolean;
  predictions: boolean;
  odds: boolean;
}

export interface LeagueSeason {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: LeagueCoverage;
}

export interface LeagueInfo {
  id: number;
  name: string;
  type: string;
  logo: string;
}

export interface LeagueCountry {
  name: string;
  code: string;
  flag: string;
}

export interface LeagueResponseItem {
  league: LeagueInfo;
  country: LeagueCountry;
  seasons: LeagueSeason[];
}

export interface LeaguesQueryParameters {
  id?: string;
  name?: string;
  country?: string;
  code?: string;
  season?: number;
  team?: number;
  type?: "league" | "cup";
  current?: "true" | "false";
  search?: string;
  last?: number;
}

export interface LeaguesPaging {
  current: number;
  total: number;
}

export interface LeaguesApiResponse {
  get: "leagues";
  parameters: LeaguesQueryParameters;
  errors: string[];
  results: number;
  paging: LeaguesPaging;
  response: LeagueResponseItem[];
}
