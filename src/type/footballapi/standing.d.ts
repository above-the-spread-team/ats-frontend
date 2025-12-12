export interface StandingTeam {
  id: number;
  name: string;
  logo: string;
}

export interface StandingGoals {
  for: number;
  against: number;
}

export interface StandingStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: StandingGoals;
}

export interface StandingEntry {
  rank: number;
  team: StandingTeam;
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string | null;
  description: string | null;
  all: StandingStats;
  home: StandingStats;
  away: StandingStats;
  update: string;
}

export interface StandingLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  standings: StandingEntry[][];
}

export interface StandingResponseItem {
  league: StandingLeague;
}

export interface StandingsQueryParameters {
  league: number;
  season: number;
  team?: number;
}

export interface StandingsPaging {
  current: number;
  total: number;
}

export interface StandingsApiResponse {
  get: "standings";
  parameters: StandingsQueryParameters;
  errors: string[];
  results: number;
  paging: StandingsPaging;
  response: StandingResponseItem[];
}
