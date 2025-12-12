export interface Team {
  id: number;
  name: string;
  code: string | null;
  country: string;
  founded: number | null;
  national: boolean;
  logo: string;
}

export interface TeamVenue {
  id: number | null;
  name: string | null;
  address: string | null;
  city: string | null;
  capacity: number | null;
  surface: string | null;
  image: string | null;
}

export interface TeamResponseItem {
  team: Team;
  venue: TeamVenue;
}

export interface TeamsQueryParameters {
  id?: number;
  name?: string;
  league?: number;
  season?: number;
  country?: string;
  code?: string;
  venue?: number;
  search?: string;
}

export interface TeamsPaging {
  current: number;
  total: number;
}

export interface TeamsApiResponse {
  get: "teams";
  parameters: TeamsQueryParameters;
  errors: string[];
  results: number;
  paging: TeamsPaging;
  response: TeamResponseItem[];
}
