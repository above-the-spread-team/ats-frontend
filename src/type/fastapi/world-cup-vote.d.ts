// ── Shared ────────────────────────────────────────────────────────────────────

export interface WorldCupTeamResponse {
  id: number;
  api_team_id: number | null;
  name: string;
  logo_url: string | null;
  group_letter: string;
}

export interface WorldCupTeamWithPercentage extends WorldCupTeamResponse {
  prediction_percentage: number;
}

export interface WorldCupGroupResponse {
  group_letter: string;
  teams: WorldCupTeamWithPercentage[];
}

// ── Vote request bodies ───────────────────────────────────────────────────────

export interface WorldCupVoteCreate {
  /** Map of group letter → exactly 2 qualifying team IDs, e.g. {"A": [1, 2], ...} */
  selections: Record<string, number[]>;
  champion_team_id: number;
  total_goals: number;
}

export type WorldCupVoteUpdate = WorldCupVoteCreate;

// ── Vote responses ────────────────────────────────────────────────────────────

export interface WorldCupVoteResponse {
  id: number;
  user_id: number | null;
  champion_team_id: number | null;
  champion_team: WorldCupTeamResponse | null;
  selections: Record<string, number[]>;
  total_goals: number;
  is_eligible: boolean;
  created_at: string; // ISO 8601
}

export interface WorldCupDeadlineResponse {
  deadline: string; // ISO 8601
  is_open: boolean;
  your_vote_exists: boolean;
}

// ── Error ─────────────────────────────────────────────────────────────────────

export interface WorldCupVoteError {
  detail: string;
}
