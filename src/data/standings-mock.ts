export interface StandingTeam {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

export interface LeagueStanding {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: StandingTeam[][];
  };
}

export const mockStandings: LeagueStanding[] = [
  {
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      standings: [
        [
          {
            rank: 1,
            team: {
              id: 40,
              name: "Liverpool",
              logo: "https://media.api-sports.io/football/teams/40.png",
            },
            points: 70,
            goalsDiff: 41,
            group: "Premier League",
            form: "WWWWW",
            status: "same",
            description: "Promotion - Champions League (Group Stage)",
            all: {
              played: 24,
              win: 23,
              draw: 1,
              lose: 0,
              goals: { for: 56, against: 15 },
            },
            home: {
              played: 12,
              win: 12,
              draw: 0,
              lose: 0,
              goals: { for: 31, against: 9 },
            },
            away: {
              played: 12,
              win: 11,
              draw: 1,
              lose: 0,
              goals: { for: 25, against: 6 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 2,
            team: {
              id: 50,
              name: "Manchester City",
              logo: "https://media.api-sports.io/football/teams/50.png",
            },
            points: 56,
            goalsDiff: 32,
            group: "Premier League",
            form: "WWDWL",
            status: "same",
            description: "Promotion - Champions League (Group Stage)",
            all: {
              played: 24,
              win: 17,
              draw: 5,
              lose: 2,
              goals: { for: 54, against: 22 },
            },
            home: {
              played: 12,
              win: 9,
              draw: 2,
              lose: 1,
              goals: { for: 30, against: 12 },
            },
            away: {
              played: 12,
              win: 8,
              draw: 3,
              lose: 1,
              goals: { for: 24, against: 10 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 3,
            team: {
              id: 42,
              name: "Arsenal",
              logo: "https://media.api-sports.io/football/teams/42.png",
            },
            points: 53,
            goalsDiff: 28,
            group: "Premier League",
            form: "WDWWL",
            status: "same",
            description: "Promotion - Champions League (Group Stage)",
            all: {
              played: 24,
              win: 16,
              draw: 5,
              lose: 3,
              goals: { for: 48, against: 20 },
            },
            home: {
              played: 12,
              win: 9,
              draw: 2,
              lose: 1,
              goals: { for: 26, against: 8 },
            },
            away: {
              played: 12,
              win: 7,
              draw: 3,
              lose: 2,
              goals: { for: 22, against: 12 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 4,
            team: {
              id: 47,
              name: "Tottenham",
              logo: "https://media.api-sports.io/football/teams/47.png",
            },
            points: 50,
            goalsDiff: 18,
            group: "Premier League",
            form: "LWWDW",
            status: "same",
            description: "Promotion - Champions League (Group Stage)",
            all: {
              played: 24,
              win: 15,
              draw: 5,
              lose: 4,
              goals: { for: 46, against: 28 },
            },
            home: {
              played: 12,
              win: 8,
              draw: 3,
              lose: 1,
              goals: { for: 25, against: 12 },
            },
            away: {
              played: 12,
              win: 7,
              draw: 2,
              lose: 3,
              goals: { for: 21, against: 16 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 5,
            team: {
              id: 66,
              name: "Aston Villa",
              logo: "https://media.api-sports.io/football/teams/66.png",
            },
            points: 47,
            goalsDiff: 15,
            group: "Premier League",
            form: "WWLDW",
            status: "same",
            description: "Promotion - Europa League (Group Stage)",
            all: {
              played: 24,
              win: 14,
              draw: 5,
              lose: 5,
              goals: { for: 42, against: 27 },
            },
            home: {
              played: 12,
              win: 8,
              draw: 2,
              lose: 2,
              goals: { for: 23, against: 11 },
            },
            away: {
              played: 12,
              win: 6,
              draw: 3,
              lose: 3,
              goals: { for: 19, against: 16 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 6,
            team: {
              id: 33,
              name: "Manchester United",
              logo: "https://media.api-sports.io/football/teams/33.png",
            },
            points: 44,
            goalsDiff: 8,
            group: "Premier League",
            form: "DWLWW",
            status: "same",
            description: "Promotion - Europa League (Group Stage)",
            all: {
              played: 24,
              win: 13,
              draw: 5,
              lose: 6,
              goals: { for: 38, against: 30 },
            },
            home: {
              played: 12,
              win: 7,
              draw: 3,
              lose: 2,
              goals: { for: 21, against: 14 },
            },
            away: {
              played: 12,
              win: 6,
              draw: 2,
              lose: 4,
              goals: { for: 17, against: 16 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 7,
            team: {
              id: 34,
              name: "Newcastle",
              logo: "https://media.api-sports.io/football/teams/34.png",
            },
            points: 42,
            goalsDiff: 10,
            group: "Premier League",
            form: "WDLWD",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 12,
              draw: 6,
              lose: 6,
              goals: { for: 40, against: 30 },
            },
            home: {
              played: 12,
              win: 7,
              draw: 3,
              lose: 2,
              goals: { for: 22, against: 13 },
            },
            away: {
              played: 12,
              win: 5,
              draw: 3,
              lose: 4,
              goals: { for: 18, against: 17 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 8,
            team: {
              id: 49,
              name: "Chelsea",
              logo: "https://media.api-sports.io/football/teams/49.png",
            },
            points: 40,
            goalsDiff: 5,
            group: "Premier League",
            form: "WLDWL",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 11,
              draw: 7,
              lose: 6,
              goals: { for: 37, against: 32 },
            },
            home: {
              played: 12,
              win: 6,
              draw: 4,
              lose: 2,
              goals: { for: 20, against: 15 },
            },
            away: {
              played: 12,
              win: 5,
              draw: 3,
              lose: 4,
              goals: { for: 17, against: 17 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 9,
            team: {
              id: 48,
              name: "West Ham",
              logo: "https://media.api-sports.io/football/teams/48.png",
            },
            points: 38,
            goalsDiff: 2,
            group: "Premier League",
            form: "LDWDL",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 11,
              draw: 5,
              lose: 8,
              goals: { for: 35, against: 33 },
            },
            home: {
              played: 12,
              win: 7,
              draw: 2,
              lose: 3,
              goals: { for: 19, against: 14 },
            },
            away: {
              played: 12,
              win: 4,
              draw: 3,
              lose: 5,
              goals: { for: 16, against: 19 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 10,
            team: {
              id: 51,
              name: "Brighton",
              logo: "https://media.api-sports.io/football/teams/51.png",
            },
            points: 36,
            goalsDiff: 0,
            group: "Premier League",
            form: "DWDLL",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 10,
              draw: 6,
              lose: 8,
              goals: { for: 34, against: 34 },
            },
            home: {
              played: 12,
              win: 6,
              draw: 3,
              lose: 3,
              goals: { for: 18, against: 15 },
            },
            away: {
              played: 12,
              win: 4,
              draw: 3,
              lose: 5,
              goals: { for: 16, against: 19 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 11,
            team: {
              id: 36,
              name: "Fulham",
              logo: "https://media.api-sports.io/football/teams/36.png",
            },
            points: 34,
            goalsDiff: -2,
            group: "Premier League",
            form: "DDLWL",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 9,
              draw: 7,
              lose: 8,
              goals: { for: 31, against: 33 },
            },
            home: {
              played: 12,
              win: 5,
              draw: 4,
              lose: 3,
              goals: { for: 17, against: 15 },
            },
            away: {
              played: 12,
              win: 4,
              draw: 3,
              lose: 5,
              goals: { for: 14, against: 18 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 12,
            team: {
              id: 39,
              name: "Wolves",
              logo: "https://media.api-sports.io/football/teams/39.png",
            },
            points: 32,
            goalsDiff: -4,
            group: "Premier League",
            form: "LLDWD",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 8,
              draw: 8,
              lose: 8,
              goals: { for: 29, against: 33 },
            },
            home: {
              played: 12,
              win: 5,
              draw: 4,
              lose: 3,
              goals: { for: 16, against: 14 },
            },
            away: {
              played: 12,
              win: 3,
              draw: 4,
              lose: 5,
              goals: { for: 13, against: 19 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 13,
            team: {
              id: 35,
              name: "Bournemouth",
              logo: "https://media.api-sports.io/football/teams/35.png",
            },
            points: 30,
            goalsDiff: -6,
            group: "Premier League",
            form: "LLWDL",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 8,
              draw: 6,
              lose: 10,
              goals: { for: 28, against: 34 },
            },
            home: {
              played: 12,
              win: 5,
              draw: 3,
              lose: 4,
              goals: { for: 15, against: 16 },
            },
            away: {
              played: 12,
              win: 3,
              draw: 3,
              lose: 6,
              goals: { for: 13, against: 18 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 14,
            team: {
              id: 52,
              name: "Crystal Palace",
              logo: "https://media.api-sports.io/football/teams/52.png",
            },
            points: 28,
            goalsDiff: -8,
            group: "Premier League",
            form: "DLLDW",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 7,
              draw: 7,
              lose: 10,
              goals: { for: 26, against: 34 },
            },
            home: {
              played: 12,
              win: 4,
              draw: 4,
              lose: 4,
              goals: { for: 14, against: 16 },
            },
            away: {
              played: 12,
              win: 3,
              draw: 3,
              lose: 6,
              goals: { for: 12, against: 18 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 15,
            team: {
              id: 45,
              name: "Everton",
              logo: "https://media.api-sports.io/football/teams/45.png",
            },
            points: 26,
            goalsDiff: -10,
            group: "Premier League",
            form: "DLLLD",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 6,
              draw: 8,
              lose: 10,
              goals: { for: 24, against: 34 },
            },
            home: {
              played: 12,
              win: 4,
              draw: 4,
              lose: 4,
              goals: { for: 13, against: 15 },
            },
            away: {
              played: 12,
              win: 2,
              draw: 4,
              lose: 6,
              goals: { for: 11, against: 19 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 16,
            team: {
              id: 46,
              name: "Leicester",
              logo: "https://media.api-sports.io/football/teams/46.png",
            },
            points: 24,
            goalsDiff: -12,
            group: "Premier League",
            form: "LLWDL",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 6,
              draw: 6,
              lose: 12,
              goals: { for: 26, against: 38 },
            },
            home: {
              played: 12,
              win: 4,
              draw: 3,
              lose: 5,
              goals: { for: 14, against: 18 },
            },
            away: {
              played: 12,
              win: 2,
              draw: 3,
              lose: 7,
              goals: { for: 12, against: 20 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 17,
            team: {
              id: 41,
              name: "Southampton",
              logo: "https://media.api-sports.io/football/teams/41.png",
            },
            points: 22,
            goalsDiff: -15,
            group: "Premier League",
            form: "LLDLL",
            status: "same",
            description: null,
            all: {
              played: 24,
              win: 5,
              draw: 7,
              lose: 12,
              goals: { for: 23, against: 38 },
            },
            home: {
              played: 12,
              win: 3,
              draw: 4,
              lose: 5,
              goals: { for: 12, against: 17 },
            },
            away: {
              played: 12,
              win: 2,
              draw: 3,
              lose: 7,
              goals: { for: 11, against: 21 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 18,
            team: {
              id: 65,
              name: "Nottingham Forest",
              logo: "https://media.api-sports.io/football/teams/65.png",
            },
            points: 20,
            goalsDiff: -18,
            group: "Premier League",
            form: "LLLWD",
            status: "same",
            description: "Relegation - Championship",
            all: {
              played: 24,
              win: 5,
              draw: 5,
              lose: 14,
              goals: { for: 21, against: 39 },
            },
            home: {
              played: 12,
              win: 3,
              draw: 3,
              lose: 6,
              goals: { for: 11, against: 18 },
            },
            away: {
              played: 12,
              win: 2,
              draw: 2,
              lose: 8,
              goals: { for: 10, against: 21 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 19,
            team: {
              id: 63,
              name: "Leeds",
              logo: "https://media.api-sports.io/football/teams/63.png",
            },
            points: 18,
            goalsDiff: -22,
            group: "Premier League",
            form: "LLLLD",
            status: "same",
            description: "Relegation - Championship",
            all: {
              played: 24,
              win: 4,
              draw: 6,
              lose: 14,
              goals: { for: 20, against: 42 },
            },
            home: {
              played: 12,
              win: 3,
              draw: 3,
              lose: 6,
              goals: { for: 11, against: 19 },
            },
            away: {
              played: 12,
              win: 1,
              draw: 3,
              lose: 8,
              goals: { for: 9, against: 23 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
          {
            rank: 20,
            team: {
              id: 44,
              name: "Burnley",
              logo: "https://media.api-sports.io/football/teams/44.png",
            },
            points: 15,
            goalsDiff: -28,
            group: "Premier League",
            form: "LLLLL",
            status: "same",
            description: "Relegation - Championship",
            all: {
              played: 24,
              win: 3,
              draw: 6,
              lose: 15,
              goals: { for: 18, against: 46 },
            },
            home: {
              played: 12,
              win: 2,
              draw: 3,
              lose: 7,
              goals: { for: 10, against: 21 },
            },
            away: {
              played: 12,
              win: 1,
              draw: 3,
              lose: 8,
              goals: { for: 8, against: 25 },
            },
            update: "2024-10-12T00:00:00+00:00",
          },
        ],
      ],
    },
  },
];
