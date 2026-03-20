export type VoteChoice = "home" | "away" | "draw";

export interface FixtureVoteCreate {
  fixture_id: number;
  vote_choice: VoteChoice;
}

/** Returned after submitting a one-time vote (POST /api/v1/votes) */
export interface FixtureVoteResponse {
  id: number;
  fixture_id: number;
  vote_choice: VoteChoice;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  league_name: string | null;
  league_logo: string | null;
  match_date: string; // ISO 8601
  created_at: string;
}

/** Aggregated voting results for a fixture (GET /today, GET /:fixture_id) */
export interface FixtureVotesResult {
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  league_name: string | null;
  league_logo: string | null;
  match_date: string;
  status: string; // "NS" | "1H" | "HT" | "2H" | "FT" | "AET" | "PEN" | …
  total_votes: number;
  home_votes: number;
  away_votes: number;
  draw_votes: number;
  home_percentage: number;
  away_percentage: number;
  draw_percentage: number;
  user_vote: VoteChoice | null;
}

/** Lightweight fixture info used for the voting popup (GET /available) */
export interface FixtureSummary {
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  league_name: string | null;
  league_logo: string | null;
  match_date: string;
  user_vote: VoteChoice | null; // populated when X-Voter-Id header is sent
}

/** Response from manual fixture sync (POST /sync) */
export interface SyncFixturesResponse {
  success: number;
  failed: number;
  fixtures_synced: number;
  message: string;
}

export interface VoteError {
  detail: string;
}
