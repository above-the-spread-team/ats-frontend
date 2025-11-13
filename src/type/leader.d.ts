export interface PlayerBirth {
  date: string;
  place: string | null;
  country: string;
}

export interface Player {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: PlayerBirth;
  nationality: string;
  height: string | null;
  weight: string | null;
  injured: boolean;
  photo: string;
}

export interface LeaderTeam {
  id: number;
  name: string;
  logo: string;
}

export interface LeaderLeague {
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
  rating: string | null;
  captain: boolean;
}

export interface PlayerSubstitutes {
  in: number;
  out: number;
  bench: number;
}

export interface PlayerShots {
  total: number | null;
  on: number | null;
}

export interface PlayerGoals {
  total: number | null;
  conceded: number | null;
  assists: number | null;
  saves: number | null;
}

export interface PlayerPasses {
  total: number | null;
  key: number | null;
  accuracy: number | null;
}

export interface PlayerTackles {
  total: number | null;
  blocks: number | null;
  interceptions: number | null;
}

export interface PlayerDuels {
  total: number | null;
  won: number | null;
}

export interface PlayerDribbles {
  attempts: number | null;
  success: number | null;
  past: number | null;
}

export interface PlayerFouls {
  drawn: number | null;
  committed: number | null;
}

export interface PlayerCards {
  yellow: number | null;
  yellowred: number | null;
  red: number | null;
}

export interface PlayerPenalty {
  won: number | null;
  commited: number | null;
  scored: number | null;
  missed: number | null;
  saved: number | null;
}

export interface PlayerStatistics {
  team: LeaderTeam;
  league: LeaderLeague;
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

export interface LeaderResponseItem {
  player: Player;
  statistics: PlayerStatistics[];
}

export interface LeadersQueryParameters {
  league: number;
  season: number;
}

export interface LeadersPaging {
  current: number;
  total: number;
}

export interface LeadersApiResponse {
  get:
    | "players/topscorers"
    | "players/topassists"
    | "players/topyellowcards"
    | "players/topredcards";
  parameters: LeadersQueryParameters;
  errors: string[];
  results: number;
  paging: LeadersPaging;
  response: LeaderResponseItem[];
}

// Specific response types for each endpoint
export interface TopScorersApiResponse extends Omit<LeadersApiResponse, "get"> {
  get: "players/topscorers";
}

export interface TopAssistsApiResponse extends Omit<LeadersApiResponse, "get"> {
  get: "players/topassists";
}

export interface TopYellowCardsApiResponse
  extends Omit<LeadersApiResponse, "get"> {
  get: "players/topyellowcards";
}

export interface TopRedCardsApiResponse
  extends Omit<LeadersApiResponse, "get"> {
  get: "players/topredcards";
}
