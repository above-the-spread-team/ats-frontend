import type { FixtureStatusShort } from "./fixture";

export interface HeadToHeadQueryParameters {
  h2h?: string; // Format: "teamId1-teamId2"
  date?: string; // YYYY-MM-DD
  league?: number;
  season?: number;
  last?: number;
  next?: number;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  status?: string;
  venue?: number;
  timezone?: string;
}

export interface HeadToHeadPaging {
  current: number;
  total: number;
}

export interface HeadToHeadFixturePeriods {
  first: number | null;
  second: number | null;
}

export interface HeadToHeadFixtureVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface HeadToHeadFixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
  extra: number | null;
}

export interface HeadToHeadFixtureDetails {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: HeadToHeadFixturePeriods;
  venue: HeadToHeadFixtureVenue;
  status: HeadToHeadFixtureStatus;
}

export interface HeadToHeadLeague {
  id: number;
  name: string;
  country: string;
  logo: string | null;
  flag: string | null;
  season: number;
  round: string | null;
}

export interface HeadToHeadTeam {
  id: number;
  name: string;
  logo: string | null;
  winner: boolean | null;
}

export interface HeadToHeadTeams {
  home: HeadToHeadTeam;
  away: HeadToHeadTeam;
}

export interface HeadToHeadGoals {
  home: number | null;
  away: number | null;
}

export interface HeadToHeadScoreBreakdown {
  home: number | null;
  away: number | null;
}

export interface HeadToHeadScore {
  halftime: HeadToHeadScoreBreakdown;
  fulltime: HeadToHeadScoreBreakdown;
  extratime: HeadToHeadScoreBreakdown;
  penalty: HeadToHeadScoreBreakdown;
}

export interface HeadToHeadResponseItem {
  fixture: HeadToHeadFixtureDetails;
  league: HeadToHeadLeague;
  teams: HeadToHeadTeams;
  goals: HeadToHeadGoals;
  score: HeadToHeadScore;
}

export interface HeadToHeadApiResponse {
  get: "fixtures/headtohead";
  parameters: HeadToHeadQueryParameters;
  errors: string[];
  results: number;
  paging: HeadToHeadPaging;
  response: HeadToHeadResponseItem[];
}
