/**
 * Comment-related types matching backend schemas
 */

export interface CommentAuthor {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface CommentBase {
  content: string;
}

export interface CommentCreate {
  content: string;
  parent_comment_id?: number | null; // ID of parent comment for replies, null for top-level
}

export interface CommentUpdate {
  content?: string;
}

export interface CommentResponse extends CommentBase {
  id: number;
  author_id: number;
  author: CommentAuthor;
  post_id: number | null; // Post ID (null for news comments)
  news_id: number | null; // News ID (null for post comments)
  parent_comment_id: number | null; // ID of parent comment (null for top-level)
  root_comment_id: number | null; // ID of root top-level comment (null for top-level)
  created_at: string;
  updated_at: string;
  replied_to_user: CommentAuthor | null; // User who was replied to (null for top-level comments)
  reply_count: number;
  reaction_count: number;
  likes: number;
  dislikes: number;
  user_reaction: boolean | null; // True for like, False for dislike, null if no reaction or not authenticated
  replies: CommentResponse[]; // Nested replies (only for top-level comments)
}

export interface CommentListResponse {
  items: CommentResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CommentError {
  detail: string;
}

export interface CommentReactionStats {
  likes: number;
  dislikes: number;
  user_reaction: boolean | null; // True for like, False for dislike, null if no reaction
}
