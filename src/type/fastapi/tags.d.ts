/**
 * Tag-related types matching backend schemas
 */

export type TagType = "league" | "team" | "player" | "topic";

export interface TagBase {
  name: string;
  type: TagType;
  external_ref?: string | null;
}

export type TagCreate = TagBase;

export interface TagUpdate {
  name?: string;
  type?: TagType;
  external_ref?: string | null;
}

export interface TagResponse extends TagBase {
  id: number;
  slug?: string | null; // From the English name; null for unslugifiable names
  translated_name?: string | null; // Only with ?lang=
  created_at: string;
  updated_at: string;
}

export interface TagListResponse {
  items: TagResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TagSummary {
  id: number;
  name: string;
  type: TagType;
  slug?: string | null; // Always from the English name, even when `name` is translated
}

// GET /api/v1/tags/hubs — league/team tags with at least one published article
export interface TagHub {
  id: number;
  name: string;
  translated_name?: string | null;
  slug?: string | null;
  type: TagType;
  news_count: number;
  last_news_at?: string | null;
}

export interface ContentTagsCreate {
  tag_ids: number[];
}

export interface ContentTagsUpdate {
  tag_ids: number[];
}

export interface AutoTagRequest {
  content: string;
  max_tags?: number;
}

export interface TagError {
  detail: string;
}
