export interface FixtureStatisticsQueryParameters {
  fixture: number;
  team?: number;
  type?: string;
  half?: boolean;
}

export interface FixtureStatisticsPaging {
  current: number;
  total: number;
}

export interface FixtureStatisticsTeam {
  id: number;
  name: string;
  logo: string;
}

export interface FixtureStatisticsItem {
  type: string;
  value: number | string | null;
}

export interface FixtureStatisticsResponseItem {
  team: FixtureStatisticsTeam;
  statistics: FixtureStatisticsItem[];
}

export interface FixtureStatisticsApiResponse {
  get: string;
  parameters: Partial<FixtureStatisticsQueryParameters>;
  errors: string[];
  results: number;
  paging: FixtureStatisticsPaging;
  response: FixtureStatisticsResponseItem[];
}
