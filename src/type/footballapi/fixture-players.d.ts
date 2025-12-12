export interface FixturePlayersQueryParameters {
  fixture: number;
  team?: number;
}

export interface FixturePlayersPaging {
  current: number;
  total: number;
}

export interface FixturePlayersTeam {
  id: number;
  name: string;
  logo: string;
  update: string;
}

export interface FixturePlayersPlayer {
  id: number;
  name: string;
  photo: string;
}

export interface FixturePlayersGames {
  minutes: number;
  number: number;
  position: string;
  rating: string;
  captain: boolean;
  substitute: boolean;
}

export interface FixturePlayersShots {
  total: number;
  on: number;
}

export interface FixturePlayersGoals {
  total: number | null;
  conceded: number | null;
  assists: number | null;
  saves: number | null;
}

export interface FixturePlayersPasses {
  total: number;
  key: number;
  accuracy: string;
}

export interface FixturePlayersTackles {
  total: number | null;
  blocks: number;
  interceptions: number;
}

export interface FixturePlayersDuels {
  total: number | null;
  won: number | null;
}

export interface FixturePlayersDribbles {
  attempts: number;
  success: number;
  past: number | null;
}

export interface FixturePlayersFouls {
  drawn: number;
  committed: number;
}

export interface FixturePlayersCards {
  yellow: number;
  red: number;
}

export interface FixturePlayersPenalty {
  won: number | null;
  commited: number | null;
  scored: number;
  missed: number;
  saved: number;
}

export interface FixturePlayersStatistics {
  games: FixturePlayersGames;
  offsides: number | null;
  shots: FixturePlayersShots;
  goals: FixturePlayersGoals;
  passes: FixturePlayersPasses;
  tackles: FixturePlayersTackles;
  duels: FixturePlayersDuels;
  dribbles: FixturePlayersDribbles;
  fouls: FixturePlayersFouls;
  cards: FixturePlayersCards;
  penalty: FixturePlayersPenalty;
}

export interface FixturePlayersPlayerItem {
  player: FixturePlayersPlayer;
  statistics: FixturePlayersStatistics[];
}

export interface FixturePlayersResponseItem {
  team: FixturePlayersTeam;
  players: FixturePlayersPlayerItem[];
}

export interface FixturePlayersApiResponse {
  get: string;
  parameters: Partial<FixturePlayersQueryParameters>;
  errors: string[];
  results: number;
  paging: FixturePlayersPaging;
  response: FixturePlayersResponseItem[];
}
