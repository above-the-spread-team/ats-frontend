/**
 * News-related types matching backend schemas
 */

export interface NewsAuthor {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface NewsTag {
  id: number;
  name: string;
  type: "league" | "team" | "player" | "topic";
}

export interface NewsResponse {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  is_published: boolean;
  author_id: number;
  author: NewsAuthor;
  created_at: string;
  updated_at: string;
  comment_count: number;
  reaction_count: number;
  tags: NewsTag[];
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
