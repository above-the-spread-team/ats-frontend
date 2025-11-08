export type FixtureStatusShort =
  | "TBD"
  | "NS"
  | "1H"
  | "HT"
  | "2H"
  | "ET"
  | "BT"
  | "P"
  | "SUSP"
  | "INT"
  | "FT"
  | "AET"
  | "PEN"
  | "PST"
  | "CANC"
  | "ABD"
  | "AWD"
  | "WO"
  | "LIVE";

export interface FixturesQueryParameters {
  id?: number;
  ids?: string;
  live?: "all" | string;
  date?: string;
  league?: number;
  season?: number;
  team?: number;
  last?: number;
  next?: number;
  from?: string;
  to?: string;
  round?: string;
  status?: string;
  venue?: number;
  timezone?: string;
}

export interface FixturesPaging {
  current: number;
  total: number;
}

export interface FixtureVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface FixturePeriods {
  first: number | null;
  second: number | null;
}

export interface FixtureStatus {
  long: string;
  short: FixtureStatusShort;
  elapsed: number | null;
  extra: number | null;
}

export interface FixtureDetails {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: FixturePeriods;
  venue: FixtureVenue;
  status: FixtureStatus;
}

export interface FixtureLeague {
  id: number;
  name: string;
  country: string;
  logo: string | null;
  flag: string | null;
  season: number;
  round: string | null;
}

export interface FixtureTeam {
  id: number;
  name: string;
  logo: string | null;
  winner: boolean | null;
}

export interface FixtureTeams {
  home: FixtureTeam;
  away: FixtureTeam;
}

export interface FixtureGoals {
  home: number | null;
  away: number | null;
}

export interface FixtureScoreBreakdown {
  home: number | null;
  away: number | null;
}

export interface FixtureScore {
  halftime: FixtureScoreBreakdown;
  fulltime: FixtureScoreBreakdown;
  extratime: FixtureScoreBreakdown;
  penalty: FixtureScoreBreakdown;
}

export interface FixtureResponseItem {
  fixture: FixtureDetails;
  league: FixtureLeague;
  teams: FixtureTeams;
  goals: FixtureGoals;
  score: FixtureScore;
}

export interface FixturesApiResponse {
  get: "fixtures";
  parameters: FixturesQueryParameters;
  errors: string[];
  results: number;
  paging: FixturesPaging;
  response: FixtureResponseItem[];
}
