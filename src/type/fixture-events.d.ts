export interface FixtureEventsQueryParameters {
  fixture: number;
  team?: number;
  player?: number;
  type?: string;
}

export interface FixtureEventsPaging {
  current: number;
  total: number;
}

export interface FixtureEventsTime {
  elapsed: number;
  extra: number | null;
}

export interface FixtureEventsTeam {
  id: number;
  name: string;
  logo: string;
}

export interface FixtureEventsPlayer {
  id: number;
  name: string;
}

export interface FixtureEventsAssist {
  id: number | null;
  name: string | null;
}

export interface FixtureEventsResponseItem {
  time: FixtureEventsTime;
  team: FixtureEventsTeam;
  player: FixtureEventsPlayer;
  assist: FixtureEventsAssist;
  type: string;
  detail: string;
  comments: string | null;
}

export interface FixtureEventsApiResponse {
  get: string;
  parameters: Partial<FixtureEventsQueryParameters>;
  errors: string[];
  results: number;
  paging: FixtureEventsPaging;
  response: FixtureEventsResponseItem[];
}
