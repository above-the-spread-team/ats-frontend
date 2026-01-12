/**
 * Odds API types from Football API
 */

export interface OddsLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

export interface OddsFixture {
  id: number;
  timezone: string;
  date: string;
  timestamp: number;
}

export interface OddsValue {
  value: string | number;
  odd: string;
}

export interface OddsBet {
  id: number;
  name: string;
  values: OddsValue[];
}

export interface OddsBookmaker {
  id: number;
  name: string;
  bets: OddsBet[];
}

export interface OddsResponseItem {
  league: OddsLeague;
  fixture: OddsFixture;
  update: string;
  bookmakers: OddsBookmaker[];
}

export interface OddsQueryParameters {
  fixture?: number;
  league?: number;
  season?: number;
  date?: string;
  timezone?: string;
  page?: number;
  bookmaker?: number;
  bet?: number;
}

export interface OddsPaging {
  current: number;
  total: number;
}

export interface OddsApiResponse {
  get: "odds";
  parameters: OddsQueryParameters;
  errors: string[];
  results: number;
  paging: OddsPaging;
  response: OddsResponseItem[];
}

