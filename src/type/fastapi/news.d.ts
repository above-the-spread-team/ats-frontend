/**
 * News-related types matching backend schemas
 */

import type { TagSummary } from "./tags";

export interface NewsAuthor {
  id: number;
  username: string;
  avatar_url: string | null;
}

// ── Structured JSON content schemas ──────────────────────────────────────────

export interface NewsSource {
  title: string;
  url: string;
}

export interface NewsEvent {
  headline: string;
  paragraphs: string[];
  sources: NewsSource[];
}

export interface GeneralNewsContent {
  type: "general_news";
  league: string;
  date: string; // YYYY-MM-DD
  events: NewsEvent[];
}

export interface MatchPreviewContent {
  type: "match_preview";
  paragraphs: string[];
  betting_tips: string[];
  sources: NewsSource[];
}

export type ParsedNewsContent = GeneralNewsContent | MatchPreviewContent;

// ─────────────────────────────────────────────────────────────────────────────

export interface NewsResponse {
  id: number;
  title: string;
  content: string | null; // Full JSON string in detail view; null in list views — use content_preview for lists
  content_preview: string | null; // Plain-text ~30-word preview; populated in list views, null in detail
  image_url: string | null; // For General News
  fixture_id: number | null; // For Match Preview
  home_team_logo: string | null; // For Match Preview only
  away_team_logo: string | null; // For Match Preview only
  is_published: boolean;
  author_id: number | null;
  author: NewsAuthor | null;
  created_at: string;
  updated_at: string;
  comment_count: number;
  reaction_count: number;
  likes: number;
  dislikes: number;
  user_reaction: boolean | null; // True for like, False for dislike, null if no reaction or not authenticated
  tags: TagSummary[];
}

export interface NewsListResponse {
  items: NewsResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface NewsError {
  detail: string;
}
