export interface SquadTeam {
  id: number;
  name: string;
  logo: string;
}

export interface SquadPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}

export interface SquadResponseItem {
  team: SquadTeam;
  players: SquadPlayer[];
}

export interface SquadsQueryParameters {
  team?: number;
  player?: number;
}

export interface SquadsPaging {
  current: number;
  total: number;
}

export interface SquadsApiResponse {
  get: "players/squads";
  parameters: SquadsQueryParameters;
  errors: string[];
  results: number;
  paging: SquadsPaging;
  response: SquadResponseItem[];
}
