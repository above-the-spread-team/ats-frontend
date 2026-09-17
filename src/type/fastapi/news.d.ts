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

// Optional SEO block added by a separate LLM call in ats-news (absent on older articles)
export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoFields {
  meta_description?: string | null;
  key_takeaways?: string[];
  faq?: FaqItem[];
}

export interface ExpertPick {
  team: string;
  confidence: "high" | "medium" | "low";
  reasons: string[];
  key_stats: string[];
}

export interface GeneralNewsContent extends SeoFields {
  type: "general_news";
  league: string;
  date: string; // YYYY-MM-DD
  events: NewsEvent[];
}

export interface MatchPreviewContent extends SeoFields {
  type: "match_preview";
  paragraphs: string[];
  betting_tips: string[];
  sources: NewsSource[];
}

export interface ExpertPerspectiveContent extends SeoFields {
  type: "expert_perspective";
  paragraphs: string[];
  expert_pick?: ExpertPick | null;
  sources: NewsSource[];
}

export type ParsedNewsContent = GeneralNewsContent | MatchPreviewContent | ExpertPerspectiveContent;

// ─────────────────────────────────────────────────────────────────────────────

export type ArticleType = "general" | "match_preview" | "expert_perspective";

export interface NewsResponse {
  id: number;
  title: string;
  slug?: string | null; // Frozen English URL slug; null/absent for unslugifiable titles

  content: string | null; // Full JSON string (detail view only). Null in list responses — use content_preview instead.
  content_preview: string | null; // ~25-word plain-text preview (list views only). Null in detail responses.
  image_url: string | null; // For General News
  fixture_id: number | null; // For Match Preview
  home_team_logo: string | null; // For Match Preview only
  away_team_logo: string | null; // For Match Preview only
  home_team_name?: string | null; // Match preview / expert perspective (null on older rows)
  away_team_name?: string | null;
  match_date?: string | null; // Kickoff ISO timestamp, when known
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
  language?: string;
  available_languages?: string[];
}

export interface NewsListResponse {
  items: NewsResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// GET /api/v1/news/sitemap — published articles without content
export interface NewsSitemapItem {
  id: number;
  slug?: string | null;
  article_type: ArticleType;
  created_at: string;
  updated_at: string;
  available_languages: string[];
  titles?: Record<string, string> | null; // only with include_titles=true
}

export interface NewsSitemapResponse {
  items: NewsSitemapItem[];
  total: number;
  page: number;
  page_size: number;
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
