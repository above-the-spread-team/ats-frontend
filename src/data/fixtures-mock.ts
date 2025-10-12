export interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
      extra: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
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
  };
}

export const mockFixtures: Fixture[] = [
  // Premier League (7 matches)
  {
    fixture: {
      id: 1001,
      referee: "Michael Oliver",
      timezone: "UTC",
      date: "2024-10-12T14:00:00+00:00",
      timestamp: 1728741600,
      periods: { first: 1728741600, second: 1728745200 },
      venue: { id: 556, name: "Old Trafford", city: "Manchester" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 33,
        name: "Manchester United",
        logo: "https://media.api-sports.io/football/teams/33.png",
        winner: false,
      },
      away: {
        id: 40,
        name: "Liverpool",
        logo: "https://media.api-sports.io/football/teams/40.png",
        winner: true,
      },
    },
    goals: { home: 1, away: 3 },
    score: {
      halftime: { home: 0, away: 2 },
      fulltime: { home: 1, away: 3 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1002,
      referee: "Anthony Taylor",
      timezone: "UTC",
      date: "2024-10-12T16:30:00+00:00",
      timestamp: 1728750600,
      periods: { first: 1728750600, second: null },
      venue: { id: 494, name: "Stamford Bridge", city: "London" },
      status: { long: "First Half", short: "1H", elapsed: 32, extra: null },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 49,
        name: "Chelsea",
        logo: "https://media.api-sports.io/football/teams/49.png",
        winner: false,
      },
      away: {
        id: 42,
        name: "Arsenal",
        logo: "https://media.api-sports.io/football/teams/42.png",
        winner: true,
      },
    },
    goals: { home: 0, away: 1 },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1003,
      referee: null,
      timezone: "UTC",
      date: "2024-10-12T19:00:00+00:00",
      timestamp: 1728759600,
      periods: { first: null, second: null },
      venue: { id: 555, name: "Etihad Stadium", city: "Manchester" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 50,
        name: "Manchester City",
        logo: "https://media.api-sports.io/football/teams/50.png",
        winner: null,
      },
      away: {
        id: 47,
        name: "Tottenham",
        logo: "https://media.api-sports.io/football/teams/47.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1004,
      referee: "Craig Pawson",
      timezone: "UTC",
      date: "2024-10-13T13:00:00+00:00",
      timestamp: 1728824400,
      periods: { first: null, second: null },
      venue: { id: 550, name: "Villa Park", city: "Birmingham" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 66,
        name: "Aston Villa",
        logo: "https://media.api-sports.io/football/teams/66.png",
        winner: null,
      },
      away: {
        id: 34,
        name: "Newcastle",
        logo: "https://media.api-sports.io/football/teams/34.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1005,
      referee: null,
      timezone: "UTC",
      date: "2024-10-13T15:30:00+00:00",
      timestamp: 1728833400,
      periods: { first: null, second: null },
      venue: { id: 508, name: "London Stadium", city: "London" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 48,
        name: "West Ham",
        logo: "https://media.api-sports.io/football/teams/48.png",
        winner: null,
      },
      away: {
        id: 35,
        name: "Bournemouth",
        logo: "https://media.api-sports.io/football/teams/35.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1006,
      referee: "Simon Hooper",
      timezone: "UTC",
      date: "2024-10-13T15:30:00+00:00",
      timestamp: 1728833400,
      periods: { first: null, second: null },
      venue: { id: 504, name: "Goodison Park", city: "Liverpool" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 45,
        name: "Everton",
        logo: "https://media.api-sports.io/football/teams/45.png",
        winner: null,
      },
      away: {
        id: 51,
        name: "Brighton",
        logo: "https://media.api-sports.io/football/teams/51.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1007,
      referee: null,
      timezone: "UTC",
      date: "2024-10-13T18:00:00+00:00",
      timestamp: 1728842400,
      periods: { first: null, second: null },
      venue: { id: 562, name: "Molineux Stadium", city: "Wolverhampton" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 39,
        name: "Wolves",
        logo: "https://media.api-sports.io/football/teams/39.png",
        winner: null,
      },
      away: {
        id: 36,
        name: "Fulham",
        logo: "https://media.api-sports.io/football/teams/36.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },

  // La Liga (7 matches)
  {
    fixture: {
      id: 2001,
      referee: "José María Sánchez",
      timezone: "UTC",
      date: "2024-10-12T17:00:00+00:00",
      timestamp: 1728752400,
      periods: { first: 1728752400, second: 1728756000 },
      venue: { id: 1456, name: "Estadio Santiago Bernabéu", city: "Madrid" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null },
    },
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      flag: "https://media.api-sports.io/flags/es.svg",
      season: 2024,
      round: "Regular Season - 9",
    },
    teams: {
      home: {
        id: 541,
        name: "Real Madrid",
        logo: "https://media.api-sports.io/football/teams/541.png",
        winner: true,
      },
      away: {
        id: 532,
        name: "Valencia",
        logo: "https://media.api-sports.io/football/teams/532.png",
        winner: false,
      },
    },
    goals: { home: 2, away: 0 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 0 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 2002,
      referee: "Antonio Mateu",
      timezone: "UTC",
      date: "2024-10-12T19:15:00+00:00",
      timestamp: 1728760500,
      periods: { first: 1728760500, second: null },
      venue: { id: 1492, name: "Camp Nou", city: "Barcelona" },
      status: { long: "Halftime", short: "HT", elapsed: 45, extra: null },
    },
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      flag: "https://media.api-sports.io/flags/es.svg",
      season: 2024,
      round: "Regular Season - 9",
    },
    teams: {
      home: {
        id: 529,
        name: "Barcelona",
        logo: "https://media.api-sports.io/football/teams/529.png",
        winner: true,
      },
      away: {
        id: 536,
        name: "Sevilla",
        logo: "https://media.api-sports.io/football/teams/536.png",
        winner: false,
      },
    },
    goals: { home: 2, away: 1 },
    score: {
      halftime: { home: 2, away: 1 },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 2003,
      referee: null,
      timezone: "UTC",
      date: "2024-10-12T21:30:00+00:00",
      timestamp: 1728768600,
      periods: { first: null, second: null },
      venue: { id: 1458, name: "Wanda Metropolitano", city: "Madrid" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      flag: "https://media.api-sports.io/flags/es.svg",
      season: 2024,
      round: "Regular Season - 9",
    },
    teams: {
      home: {
        id: 530,
        name: "Atlético Madrid",
        logo: "https://media.api-sports.io/football/teams/530.png",
        winner: null,
      },
      away: {
        id: 548,
        name: "Real Sociedad",
        logo: "https://media.api-sports.io/football/teams/548.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 2004,
      referee: "Ricardo de Burgos",
      timezone: "UTC",
      date: "2024-10-13T12:00:00+00:00",
      timestamp: 1728820800,
      periods: { first: null, second: null },
      venue: { id: 1489, name: "Benito Villamarín", city: "Sevilla" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      flag: "https://media.api-sports.io/flags/es.svg",
      season: 2024,
      round: "Regular Season - 9",
    },
    teams: {
      home: {
        id: 543,
        name: "Real Betis",
        logo: "https://media.api-sports.io/football/teams/543.png",
        winner: null,
      },
      away: {
        id: 533,
        name: "Villarreal",
        logo: "https://media.api-sports.io/football/teams/533.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 2005,
      referee: null,
      timezone: "UTC",
      date: "2024-10-13T14:15:00+00:00",
      timestamp: 1728828900,
      periods: { first: null, second: null },
      venue: { id: 1463, name: "Estadio de San Mamés", city: "Bilbao" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      flag: "https://media.api-sports.io/flags/es.svg",
      season: 2024,
      round: "Regular Season - 9",
    },
    teams: {
      home: {
        id: 531,
        name: "Athletic Club",
        logo: "https://media.api-sports.io/football/teams/531.png",
        winner: null,
      },
      away: {
        id: 727,
        name: "Osasuna",
        logo: "https://media.api-sports.io/football/teams/727.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 2006,
      referee: "Guillermo Cuadra",
      timezone: "UTC",
      date: "2024-10-13T16:30:00+00:00",
      timestamp: 1728837000,
      periods: { first: null, second: null },
      venue: {
        id: 1487,
        name: "Estadio Ramón Sánchez Pizjuán",
        city: "Sevilla",
      },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      flag: "https://media.api-sports.io/flags/es.svg",
      season: 2024,
      round: "Regular Season - 9",
    },
    teams: {
      home: {
        id: 536,
        name: "Sevilla",
        logo: "https://media.api-sports.io/football/teams/536.png",
        winner: null,
      },
      away: {
        id: 798,
        name: "Mallorca",
        logo: "https://media.api-sports.io/football/teams/798.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 2007,
      referee: null,
      timezone: "UTC",
      date: "2024-10-13T19:00:00+00:00",
      timestamp: 1728846000,
      periods: { first: null, second: null },
      venue: { id: 1475, name: "RCDE Stadium", city: "Barcelona" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      flag: "https://media.api-sports.io/flags/es.svg",
      season: 2024,
      round: "Regular Season - 9",
    },
    teams: {
      home: {
        id: 538,
        name: "Espanyol",
        logo: "https://media.api-sports.io/football/teams/538.png",
        winner: null,
      },
      away: {
        id: 546,
        name: "Getafe",
        logo: "https://media.api-sports.io/football/teams/546.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },

  // Serie A (7 matches)
  {
    fixture: {
      id: 3001,
      referee: "Daniele Orsato",
      timezone: "UTC",
      date: "2024-10-12T16:00:00+00:00",
      timestamp: 1728748800,
      periods: { first: 1728748800, second: 1728752400 },
      venue: { id: 907, name: "San Siro", city: "Milano" },
      status: { long: "Match Finished", short: "FT", elapsed: 90, extra: null },
    },
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      flag: "https://media.api-sports.io/flags/it.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 489,
        name: "AC Milan",
        logo: "https://media.api-sports.io/football/teams/489.png",
        winner: false,
      },
      away: {
        id: 487,
        name: "Inter",
        logo: "https://media.api-sports.io/football/teams/487.png",
        winner: true,
      },
    },
    goals: { home: 1, away: 2 },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: 1, away: 2 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 3002,
      referee: "Marco Di Bello",
      timezone: "UTC",
      date: "2024-10-12T18:30:00+00:00",
      timestamp: 1728757800,
      periods: { first: 1728757800, second: null },
      venue: { id: 909, name: "Allianz Stadium", city: "Torino" },
      status: { long: "Second Half", short: "2H", elapsed: 67, extra: null },
    },
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      flag: "https://media.api-sports.io/flags/it.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 496,
        name: "Juventus",
        logo: "https://media.api-sports.io/football/teams/496.png",
        winner: false,
      },
      away: {
        id: 492,
        name: "Napoli",
        logo: "https://media.api-sports.io/football/teams/492.png",
        winner: true,
      },
    },
    goals: { home: 1, away: 2 },
    score: {
      halftime: { home: 1, away: 1 },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 3003,
      referee: null,
      timezone: "UTC",
      date: "2024-10-12T20:45:00+00:00",
      timestamp: 1728766500,
      periods: { first: null, second: null },
      venue: { id: 911, name: "Stadio Olimpico", city: "Roma" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      flag: "https://media.api-sports.io/flags/it.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 497,
        name: "AS Roma",
        logo: "https://media.api-sports.io/football/teams/497.png",
        winner: null,
      },
      away: {
        id: 487,
        name: "Lazio",
        logo: "https://media.api-sports.io/football/teams/487.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 3004,
      referee: "Fabio Maresca",
      timezone: "UTC",
      date: "2024-10-13T11:30:00+00:00",
      timestamp: 1728819000,
      periods: { first: null, second: null },
      venue: { id: 910, name: "Stadio Artemio Franchi", city: "Firenze" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      flag: "https://media.api-sports.io/flags/it.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 502,
        name: "Fiorentina",
        logo: "https://media.api-sports.io/football/teams/502.png",
        winner: null,
      },
      away: {
        id: 489,
        name: "AC Milan",
        logo: "https://media.api-sports.io/football/teams/489.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 3005,
      referee: null,
      timezone: "UTC",
      date: "2024-10-13T14:00:00+00:00",
      timestamp: 1728828000,
      periods: { first: null, second: null },
      venue: { id: 914, name: "Stadio Luigi Ferraris", city: "Genova" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      flag: "https://media.api-sports.io/flags/it.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 488,
        name: "Genoa",
        logo: "https://media.api-sports.io/football/teams/488.png",
        winner: null,
      },
      away: {
        id: 500,
        name: "Bologna",
        logo: "https://media.api-sports.io/football/teams/500.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 3006,
      referee: "Luca Pairetto",
      timezone: "UTC",
      date: "2024-10-13T16:00:00+00:00",
      timestamp: 1728835200,
      periods: { first: null, second: null },
      venue: { id: 920, name: "Gewiss Stadium", city: "Bergamo" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      flag: "https://media.api-sports.io/flags/it.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 499,
        name: "Atalanta",
        logo: "https://media.api-sports.io/football/teams/499.png",
        winner: null,
      },
      away: {
        id: 496,
        name: "Juventus",
        logo: "https://media.api-sports.io/football/teams/496.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 3007,
      referee: null,
      timezone: "UTC",
      date: "2024-10-13T18:30:00+00:00",
      timestamp: 1728844200,
      periods: { first: null, second: null },
      venue: { id: 905, name: "Stadio Diego Armando Maradona", city: "Napoli" },
      status: { long: "Not Started", short: "NS", elapsed: null, extra: null },
    },
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      flag: "https://media.api-sports.io/flags/it.svg",
      season: 2024,
      round: "Regular Season - 8",
    },
    teams: {
      home: {
        id: 492,
        name: "Napoli",
        logo: "https://media.api-sports.io/football/teams/492.png",
        winner: null,
      },
      away: {
        id: 497,
        name: "AS Roma",
        logo: "https://media.api-sports.io/football/teams/497.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  },
];
