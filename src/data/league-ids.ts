export interface LeagueInfo {
  id: number;
  name: string;
  type: "League" | "Cup";
  logo: string;
}

export const LEAGUE_IDS = [2, 3, 848, 39, 140, 135, 78, 61, 1] as const;

export type LeagueId = (typeof LEAGUE_IDS)[number];

export const LEAGUE_INFO: Record<LeagueId, LeagueInfo> = {
  2: {
    id: 2,
    name: "UEFA Champions League",
    type: "Cup",
    logo: "https://media.api-sports.io/football/leagues/2.png",
  },
  3: {
    id: 3,
    name: "UEFA Europa League",
    type: "Cup",
    logo: "https://media.api-sports.io/football/leagues/3.png",
  },
  848: {
    id: 848,
    name: "UEFA Europa Conference League",
    type: "Cup",
    logo: "https://media.api-sports.io/football/leagues/848.png",
  },
  39: {
    id: 39,
    name: "Premier League",
    type: "League",
    logo: "https://media.api-sports.io/football/leagues/39.png",
  },
  140: {
    id: 140,
    name: "La Liga",
    type: "League",
    logo: "https://media.api-sports.io/football/leagues/140.png",
  },
  135: {
    id: 135,
    name: "Serie A",
    type: "League",
    logo: "https://media.api-sports.io/football/leagues/135.png",
  },
  78: {
    id: 78,
    name: "Bundesliga",
    type: "League",
    logo: "https://media.api-sports.io/football/leagues/78.png",
  },
  61: {
    id: 61,
    name: "Ligue 1",
    type: "League",
    logo: "https://media.api-sports.io/football/leagues/61.png",
  },
  1: {
    id: 1,
    name: "World Cup",
    type: "Cup",
    logo: "https://media.api-sports.io/football/leagues/1.png",
  },
};

// Helper functions
export function getLeagueInfo(leagueId: LeagueId): LeagueInfo {
  return LEAGUE_INFO[leagueId];
}

export function getLeagueName(leagueId: LeagueId): string {
  return LEAGUE_INFO[leagueId].name;
}

export function getLeagueLogo(leagueId: LeagueId): string {
  return LEAGUE_INFO[leagueId].logo;
}

export function isLeague(leagueId: LeagueId): boolean {
  return LEAGUE_INFO[leagueId].type === "League";
}

export function isCup(leagueId: LeagueId): boolean {
  return LEAGUE_INFO[leagueId].type === "Cup";
}

// Get all leagues filtered by type
export function getLeaguesByType(type: "League" | "Cup"): LeagueInfo[] {
  return LEAGUE_IDS.filter((id) => LEAGUE_INFO[id].type === type).map(
    (id) => LEAGUE_INFO[id],
  );
}

// Get all domestic leagues
export function getDomesticLeagues(): LeagueInfo[] {
  return getLeaguesByType("League");
}

// Get all international cups
export function getInternationalCups(): LeagueInfo[] {
  return getLeaguesByType("Cup");
}
