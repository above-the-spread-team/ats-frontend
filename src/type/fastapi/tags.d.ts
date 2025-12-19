/**
 * Tag-related types matching backend schemas
 */

export type TagType = "league" | "team" | "player" | "topic";

export interface TagBase {
  name: string;
  type: TagType;
  external_ref?: string | null;
}

export interface TagCreate extends TagBase {}

export interface TagUpdate {
  name?: string;
  type?: TagType;
  external_ref?: string | null;
}

export interface TagResponse extends TagBase {
  id: number;
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
