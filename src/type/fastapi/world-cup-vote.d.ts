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

// ── Prediction request bodies ─────────────────────────────────────────────────

export interface WorldCupGroupPredictionItem {
  group_letter: string;
  winner_team_id: number;
}

export interface WorldCupPredictionCreate {
  group_predictions: WorldCupGroupPredictionItem[];
  champion_team_id: number;
}

export type WorldCupPredictionUpdate = WorldCupPredictionCreate;

// ── Prediction responses ──────────────────────────────────────────────────────

export interface WorldCupGroupPredictionResponse {
  group_letter: string;
  winner_team_id: number | null;
  winner_team: WorldCupTeamResponse | null;
}

export interface WorldCupPredictionResponse {
  id: number;
  user_id: number;
  champion_team_id: number | null;
  champion_team: WorldCupTeamResponse | null;
  group_predictions: WorldCupGroupPredictionResponse[];
  is_locked: boolean;
  created_at: string; // ISO 8601
  updated_at: string;
}

export interface WorldCupDeadlineResponse {
  deadline: string; // ISO 8601
  is_open: boolean;
  your_prediction_exists: boolean;
}

export interface WorldCupVoteError {
  detail: string;
}
