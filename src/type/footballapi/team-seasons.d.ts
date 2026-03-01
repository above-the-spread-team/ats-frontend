export interface TeamSeasonsApiResponse {
  get: "teams/seasons";
  parameters: { team: string };
  errors: string[];
  results: number;
  paging: { current: number; total: number };
  response: number[];
}
