/**
 * Post-related types matching backend schemas
 */

import type { TagSummary } from "./tags";

export interface PostAuthor {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface PostBase {
  content: string;
  image_url: string | null;
  group_id: number | null;
}

export interface PostCreate {
  content: string;
  image_url?: string | null;
  group_id?: number | null;
}

export interface PostUpdate {
  content?: string;
  image_url?: string | null;
  group_id?: number | null;
}

export type PostDateFilter = "24h" | "week" | "month";

export type PostSortOption = "most_liked" | "most_disliked" | "most_commented";

export interface PostResponse extends PostBase {
  id: number;
  author_id: number;
  author: PostAuthor;
  created_at: string;
  updated_at: string;
  group_name?: string | null; // Group name if post belongs to a group
  group_icon_url?: string | null; // Group icon URL if post belongs to a group
  comment_count: number;
  reaction_count: number;
  likes: number;
  dislikes: number;
  user_reaction: boolean | null; // True for like, False for dislike, null if no reaction or not authenticated
  tags: TagSummary[];
}

export interface PostListResponse {
  items: PostResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PostError {
  detail: string;
}

export interface ReactionStats {
  likes: number;
  dislikes: number;
  user_reaction: boolean | null; // True for like, False for dislike, null if no reaction
}
