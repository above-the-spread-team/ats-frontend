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

export interface ExpertPerspectiveContent {
  type: "expert_perspective";
  paragraphs: string[];
  sources: NewsSource[];
}

export type ParsedNewsContent = GeneralNewsContent | MatchPreviewContent | ExpertPerspectiveContent;

// ─────────────────────────────────────────────────────────────────────────────

export type ArticleType = "general" | "match_preview" | "expert_perspective";

export interface NewsResponse {
  id: number;
  title: string;
  content: string | null; // Full JSON string (detail view only). Null in list responses — use content_preview instead.
  content_preview: string | null; // ~25-word plain-text preview (list views only). Null in detail responses.
  image_url: string | null; // For General News
  fixture_id: number | null; // For Match Preview
  home_team_logo: string | null; // For Match Preview only
  away_team_logo: string | null; // For Match Preview only
  article_type?: ArticleType; // general, match_preview, or expert_perspective (may be missing in list responses)
  expert_name: string | null; // Expert display name (expert_perspective only)
  expert_avatar_url: string | null; // Expert avatar URL (expert_perspective only)
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

export interface NewsCreate {
  title: string;
  content: string;
  image_url?: string | null;
  fixture_id?: number | null;
  home_team_logo?: string | null;
  away_team_logo?: string | null;
  article_type?: ArticleType; // Default: "general"
  expert_name?: string | null; // Expert display name (expert_perspective only)
  expert_avatar_url?: string | null; // Expert avatar URL (expert_perspective only)
  is_published?: boolean; // Default: true
}

export interface NewsUpdate {
  title?: string | null;
  content?: string | null;
  image_url?: string | null;
  fixture_id?: number | null;
  home_team_logo?: string | null;
  away_team_logo?: string | null;
  article_type?: ArticleType | null;
  expert_name?: string | null;
  expert_avatar_url?: string | null;
  is_published?: boolean | null;
}

export interface ExpertPerspectiveCreate {
  title: string;
  content: string;
  image_url?: string | null;
  is_published?: boolean;
  tag_ids?: number[];
}

export interface NewsError {
  detail: string;
}
