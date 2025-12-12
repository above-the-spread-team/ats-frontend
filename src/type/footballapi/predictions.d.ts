export interface PredictionsQueryParameters {
  fixture: number;
}

export interface PredictionsPaging {
  current: number;
  total: number;
}

export interface PredictionsWinner {
  id: number;
  name: string;
  comment: string;
}

export interface PredictionsGoals {
  home: string;
  away: string;
}

export interface PredictionsPercent {
  home: string;
  draw: string;
  away: string;
}

export interface PredictionsData {
  winner: PredictionsWinner;
  win_or_draw: boolean;
  under_over: string;
  goals: PredictionsGoals;
  advice: string;
  percent: PredictionsPercent;
}

export interface PredictionsLast5Goals {
  total: number;
  average: number;
}

export interface PredictionsLast5 {
  form: string;
  att: string;
  def: string;
  goals: {
    for: PredictionsLast5Goals;
    against: PredictionsLast5Goals;
  };
}

export interface PredictionsFixtures {
  played: {
    home: number;
    away: number;
    total: number;
  };
  wins: {
    home: number;
    away: number;
    total: number;
  };
  draws: {
    home: number;
    away: number;
    total: number;
  };
  loses: {
    home: number;
    away: number;
    total: number;
  };
}

export interface PredictionsGoalsTotal {
  home: number;
  away: number;
  total: number;
}

export interface PredictionsGoalsAverage {
  home: string;
  away: string;
  total: string;
}

export interface PredictionsLeagueGoals {
  for: {
    total: PredictionsGoalsTotal;
    average: PredictionsGoalsAverage;
  };
  against: {
    total: PredictionsGoalsTotal;
    average: PredictionsGoalsAverage;
  };
}

export interface PredictionsBiggestStreak {
  wins: number;
  draws: number;
  loses: number;
}

export interface PredictionsBiggestWins {
  home: string;
  away: string;
}

export interface PredictionsBiggestLoses {
  home: string;
  away: string;
}

export interface PredictionsBiggestGoals {
  for: {
    home: number;
    away: number;
  };
  against: {
    home: number;
    away: number;
  };
}

export interface PredictionsBiggest {
  streak: PredictionsBiggestStreak;
  wins: PredictionsBiggestWins;
  loses: PredictionsBiggestLoses;
  goals: PredictionsBiggestGoals;
}

export interface PredictionsCleanSheet {
  home: number;
  away: number;
  total: number;
}

export interface PredictionsFailedToScore {
  home: number;
  away: number;
  total: number;
}

export interface PredictionsTeamLeague {
  form: string;
  fixtures: PredictionsFixtures;
  goals: PredictionsLeagueGoals;
  biggest: PredictionsBiggest;
  clean_sheet: PredictionsCleanSheet;
  failed_to_score: PredictionsFailedToScore;
}

export interface PredictionsTeam {
  id: number;
  name: string;
  logo: string;
  last_5: PredictionsLast5;
  league: PredictionsTeamLeague;
}

export interface PredictionsTeams {
  home: PredictionsTeam;
  away: PredictionsTeam;
}

export interface PredictionsComparison {
  form: {
    home: string;
    away: string;
  };
  att: {
    home: string;
    away: string;
  };
  def: {
    home: string;
    away: string;
  };
  poisson_distribution: {
    home: string;
    away: string;
  };
  h2h: {
    home: string;
    away: string;
  };
  goals: {
    home: string;
    away: string;
  };
  total: {
    home: string;
    away: string;
  };
}

export interface PredictionsFixtureVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface PredictionsFixturePeriods {
  first: number | null;
  second: number | null;
}

export interface PredictionsFixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
  extra: number | null;
}

export interface PredictionsFixtureDetails {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: PredictionsFixturePeriods;
  venue: PredictionsFixtureVenue;
  status: PredictionsFixtureStatus;
}

export interface PredictionsH2HLeague {
  id: number;
  name: string;
  country: string;
  logo: string | null;
  flag: string | null;
  season: number;
  round: string | null;
}

export interface PredictionsH2HTeam {
  id: number;
  name: string;
  logo: string | null;
  winner: boolean | null;
}

export interface PredictionsH2HTeams {
  home: PredictionsH2HTeam;
  away: PredictionsH2HTeam;
}

export interface PredictionsH2HGoals {
  home: number;
  away: number;
}

export interface PredictionsH2HScore {
  halftime: {
    home: number | null;
    away: number | null;
  };
  fulltime: {
    home: number | null;
    away: number | null;
  };
  extratime: {
    home: number | null;
    away: number | null;
  };
  penalty: {
    home: number | null;
    away: number | null;
  };
}

export interface PredictionsH2HItem {
  fixture: PredictionsFixtureDetails;
  league: PredictionsH2HLeague;
  teams: PredictionsH2HTeams;
  goals: PredictionsH2HGoals;
  score: PredictionsH2HScore;
}

export interface PredictionsLeague {
  id: number;
  name: string;
  country: string;
  logo: string | null;
  flag: string | null;
  season: number;
}

export interface PredictionsResponseItem {
  predictions: PredictionsData;
  league: PredictionsLeague;
  teams: PredictionsTeams;
  comparison: PredictionsComparison;
  h2h: PredictionsH2HItem[];
}

export interface PredictionsApiResponse {
  get: string;
  parameters: Partial<PredictionsQueryParameters>;
  errors: string[];
  results: number;
  paging: PredictionsPaging;
  response: PredictionsResponseItem[];
}
