/**
 * Post-related types matching backend schemas
 */

export interface PostAuthor {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface PostBase {
  content: string;
  image_url: string | null;
}

export interface PostCreate {
  content: string;
  image_url?: string | null;
}

export interface PostUpdate {
  content?: string;
  image_url?: string | null;
}

export interface PostResponse extends PostBase {
  id: number;
  author_id: number;
  author: PostAuthor;
  created_at: string;
  updated_at: string;
  comment_count: number;
  reaction_count: number;
  likes: number;
  dislikes: number;
  user_reaction: boolean | null; // True for like, False for dislike, null if no reaction or not authenticated
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
