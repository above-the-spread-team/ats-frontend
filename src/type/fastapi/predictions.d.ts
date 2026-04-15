export interface UserPredictionStats {
  user_accuracy: number;        // 0–100 percentage
  correct_predictions: number;
  total_predictions: number;    // resolved votes only (is_correct IS NOT NULL)
  score: number;                // 0–100 Bayesian-adjusted score (same formula as leaderboard)
  community_accuracy: number;   // across all authenticated users
  total_players: number;        // distinct users with ≥1 resolved vote
  current_win_streak: number;
  max_win_streak: number;
}

export interface PredictionHistoryItem {
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  league_name: string | null;
  league_logo: string | null;
  match_date: string;           // ISO 8601
  /** User's pick: home / away / draw (display with capitalize in UI). */
  vote_choice: "home" | "away" | "draw";
  is_correct: boolean;
  result: string | null;        // fixture's actual result
}

export interface PredictionHistoryResponse {
  items: PredictionHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar_url: string | null;
  accuracy: number;             // 0–100 raw percentage
  score: number;                // 0–100 Bayesian-adjusted score used for ranking
  total_games: number;          // resolved games played
  correct_predictions: number;
}

export interface LeaderboardResponse {
  top_10: LeaderboardEntry[];
  user_entry: LeaderboardEntry | null; // null if user has < 15 resolved games or not authenticated
  period_start: string | null;         // null for "overall"; ISO 8601 first day of the month otherwise
  period_end: string | null;           // null for "overall"/"monthly"; exclusive upper bound for "last_month"
}

export interface MonthlyWinnerResponse {
  period_year: number;
  period_month: number;
  user_id: number | null;  // null if the user account was deleted
  username: string;
  avatar_url: string | null;
  accuracy: number;
  total_games: number;
  correct_predictions: number;
  captured_at: string;     // ISO 8601
}

export type LeaderboardTimeRange = "overall" | "monthly" | "last_month";

export interface PredictionError {
  detail: string;
}
