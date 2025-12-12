export interface PlayerBirth {
  date: string;
  place: string;
  country: string;
}

export interface PlayerInfo {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: PlayerBirth;
  nationality: string;
  height: string;
  weight: string;
  injured: boolean;
  photo: string;
}

export interface PlayerTeam {
  id: number;
  name: string;
  logo: string;
}

export interface PlayerLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

export interface PlayerGames {
  appearences: number;
  lineups: number;
  minutes: number;
  number: number | null;
  position: string;
  rating: string;
  captain: boolean;
}

export interface PlayerSubstitutes {
  in: number;
  out: number;
  bench: number;
}

export interface PlayerShots {
  total: number;
  on: number;
}

export interface PlayerGoals {
  total: number;
  conceded: number | null;
  assists: number;
  saves: number;
}

export interface PlayerPasses {
  total: number;
  key: number;
  accuracy: number;
}

export interface PlayerTackles {
  total: number;
  blocks: number;
  interceptions: number;
}

export interface PlayerDuels {
  total: number | null;
  won: number | null;
}

export interface PlayerDribbles {
  attempts: number;
  success: number;
  past: number | null;
}

export interface PlayerFouls {
  drawn: number;
  committed: number;
}

export interface PlayerCards {
  yellow: number;
  yellowred: number;
  red: number;
}

export interface PlayerPenalty {
  won: number;
  commited: number | null;
  scored: number;
  missed: number;
  saved: number | null;
}

export interface PlayerStatistics {
  team: PlayerTeam;
  league: PlayerLeague;
  games: PlayerGames;
  substitutes: PlayerSubstitutes;
  shots: PlayerShots;
  goals: PlayerGoals;
  passes: PlayerPasses;
  tackles: PlayerTackles;
  duels: PlayerDuels;
  dribbles: PlayerDribbles;
  fouls: PlayerFouls;
  cards: PlayerCards;
  penalty: PlayerPenalty;
}

export interface PlayerStatisticsResponseItem {
  player: PlayerInfo;
  statistics: PlayerStatistics[];
}

export interface PlayerStatisticsQueryParameters {
  id?: string;
  team?: string;
  league?: string;
  season?: string;
  search?: string;
  page?: string;
}

export interface PlayerStatisticsPaging {
  current: number;
  total: number;
}

export interface PlayerStatisticsApiResponse {
  get: string;
  parameters: PlayerStatisticsQueryParameters;
  errors: string[];
  results: number;
  paging: PlayerStatisticsPaging;
  response: PlayerStatisticsResponseItem[];
}
