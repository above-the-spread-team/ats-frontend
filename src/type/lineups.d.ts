export interface LineupsQueryParameters {
  fixture: number;
  team?: number;
  player?: number;
  type?: string;
}

export interface LineupsPaging {
  current: number;
  total: number;
}

export interface TeamColors {
  player: {
    primary: string;
    number: string;
    border: string;
  };
  goalkeeper: {
    primary: string;
    number: string;
    border: string;
  };
}

export interface LineupTeam {
  id: number;
  name: string;
  logo: string | null;
  colors: TeamColors;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number;
  pos: string; // Position: G, D, M, F
  grid: string | null; // Format: "X:Y" where X is row, Y is column
}

export interface LineupPlayerItem {
  player: LineupPlayer;
}

export interface LineupCoach {
  id: number;
  name: string;
  photo: string | null;
}

export interface LineupResponseItem {
  team: LineupTeam;
  formation: string | null;
  startXI: LineupPlayerItem[];
  substitutes: LineupPlayerItem[];
  coach: LineupCoach | null;
}

export interface LineupsApiResponse {
  get: "fixtures/lineups";
  parameters: LineupsQueryParameters;
  errors: string[];
  results: number;
  paging: LineupsPaging;
  response: LineupResponseItem[];
}
