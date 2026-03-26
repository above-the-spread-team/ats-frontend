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
  /** `"user"` | `"fixture"` | null for standalone posts */
  group_type?: "user" | "fixture" | null;
  /** API-Football fixture id — deep link to match; only when group_type === "fixture" */
  fixture_api_id?: number | null;
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

/**
 * Nested comment tree on discuss post cards (camelCase UI model).
 * Align with mapCommentResponse in comment-item.tsx.
 */
export interface PostComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  replies?: PostComment[];
  userLiked?: boolean;
  userDisliked?: boolean;
  parentCommentId?: number | null;
  repliedToUser?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

/**
 * Client-side post model for discuss UI (camelCase, string ids).
 * Built from PostResponse via mapPostResponse in post-card.tsx.
 */
export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
  comments: PostComment[];
  userLiked?: boolean;
  userDisliked?: boolean;
  groupId?: number | null;
  groupName?: string | null;
  groupIconUrl?: string | null;
  groupType?: "user" | "fixture" | null;
  fixtureApiId?: number | null;
}

export interface PostError {
  detail: string;
}

export interface ReactionStats {
  likes: number;
  dislikes: number;
  user_reaction: boolean | null; // True for like, False for dislike, null if no reaction
}
