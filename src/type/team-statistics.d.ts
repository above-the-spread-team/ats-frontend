export interface StatisticLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

export interface StatisticTeam {
  id: number;
  name: string;
  logo: string;
}

export interface HomeAwayTotal {
  home: number;
  away: number;
  total: number;
}

export interface TeamFixtures {
  played: HomeAwayTotal;
  wins: HomeAwayTotal;
  draws: HomeAwayTotal;
  loses: HomeAwayTotal;
}

export interface GoalsTotal {
  home: number;
  away: number;
  total: number;
}

export interface GoalsAverage {
  home: string;
  away: string;
  total: string;
}

export interface MinuteStat {
  total: number | null;
  percentage: string | null;
}

export interface GoalsByMinute {
  "0-15": MinuteStat;
  "16-30": MinuteStat;
  "31-45": MinuteStat;
  "46-60": MinuteStat;
  "61-75": MinuteStat;
  "76-90": MinuteStat;
  "91-105": MinuteStat;
  "106-120": MinuteStat;
}

export interface UnderOverStat {
  over: number;
  under: number;
}

export interface GoalsUnderOver {
  "0.5": UnderOverStat;
  "1.5": UnderOverStat;
  "2.5": UnderOverStat;
  "3.5": UnderOverStat;
  "4.5": UnderOverStat;
}

export interface GoalsFor {
  total: GoalsTotal;
  average: GoalsAverage;
  minute: GoalsByMinute;
  under_over: GoalsUnderOver;
}

export interface GoalsAgainst {
  total: GoalsTotal;
  average: GoalsAverage;
  minute: GoalsByMinute;
  under_over: GoalsUnderOver;
}

export interface TeamGoals {
  for: GoalsFor;
  against: GoalsAgainst;
}

export interface BiggestStreak {
  wins: number;
  draws: number;
  loses: number;
}

export interface BiggestWinsLoses {
  home: string;
  away: string;
}

export interface BiggestGoals {
  for: {
    home: number;
    away: number;
  };
  against: {
    home: number;
    away: number;
  };
}

export interface Biggest {
  streak: BiggestStreak;
  wins: BiggestWinsLoses;
  loses: BiggestWinsLoses;
  goals: BiggestGoals;
}

export interface CleanSheet {
  home: number;
  away: number;
  total: number;
}

export interface FailedToScore {
  home: number;
  away: number;
  total: number;
}

export interface PenaltyStats {
  scored: {
    total: number;
    percentage: string;
  };
  missed: {
    total: number;
    percentage: string;
  };
  total: number;
}

export interface Lineup {
  formation: string;
  played: number;
}

export interface CardsByMinute {
  "0-15": MinuteStat;
  "16-30": MinuteStat;
  "31-45": MinuteStat;
  "46-60": MinuteStat;
  "61-75": MinuteStat;
  "76-90": MinuteStat;
  "91-105": MinuteStat;
  "106-120": MinuteStat;
}

export interface TeamCards {
  yellow: CardsByMinute;
  red: CardsByMinute;
}

export interface TeamStatisticsResponse {
  league: StatisticLeague;
  team: StatisticTeam;
  form: string;
  fixtures: TeamFixtures;
  goals: TeamGoals;
  biggest: Biggest;
  clean_sheet: CleanSheet;
  failed_to_score: FailedToScore;
  penalty: PenaltyStats;
  lineups: Lineup[];
  cards: TeamCards;
}

export interface TeamStatisticsQueryParameters {
  league: number;
  season: number;
  team: number;
  date?: string;
}

export interface TeamStatisticsPaging {
  current: number;
  total: number;
}

export interface TeamStatisticsApiResponse {
  get: "teams/statistics";
  parameters: TeamStatisticsQueryParameters;
  errors: string[];
  results: number;
  paging: TeamStatisticsPaging;
  response: TeamStatisticsResponse;
}
