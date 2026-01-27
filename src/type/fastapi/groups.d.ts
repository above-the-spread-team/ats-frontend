/**
 * Group-related types matching backend schemas
 */
import type { TagSummary } from "./tags";

export interface GroupBase {
  name: string;
  description: string | null;
  icon_url: string | null;
  is_private: boolean;
}

export interface GroupCreate {
  name: string;
  description?: string | null;
  icon_url?: string | null;
  is_private?: boolean;
  tag_ids?: number[]; // Optional list of tag IDs to associate with the group
}

export interface GroupUpdate {
  name?: string;
  description?: string | null;
  icon_url?: string | null;
  is_private?: boolean;
  tag_ids?: number[]; // Optional list of tag IDs to associate with the group (replaces existing tags)
}

export interface GroupFollowerResponse {
  user_id: number;
  joined_at: string;
}

export interface GroupFollowerItem {
  id: number; // User ID
  username: string; // Follower username
  avatar_url: string | null; // Follower avatar URL
}

export interface GroupFollowerListResponse {
  items: GroupFollowerItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GroupResponse extends GroupBase {
  id: number;
  owner_id: number;
  created_at: string;
  member_count: number; // Number of members in the group (backend returns this, not members array)
  total_likes: number; // Total likes on all group posts
  total_dislikes: number; // Total dislikes on all group posts
  post_count: number; // Number of posts in the group
  comment_count: number; // Number of comments on group posts
  pending_count: number | null; // Number of pending followers (owner/admin only, null for regular users)
  tags: TagSummary[]; // Associated tags
}

export interface GroupListItem extends GroupBase {
  id: number;
  owner_id: number;
  created_at: string;
  // Note: GroupListItem does NOT include member_count (only in GroupResponse)
}

export interface GroupFollowerAddRequest {
  user_id: number;
}

export interface GroupListResponse {
  items: GroupListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GroupPublicListItem {
  id: number;
  name: string;
  icon_url: string | null;
  is_private: boolean;
  owner_id: number;
  created_at: string;
  member_count: number; // Number of members in the group (included in public list)
  post_count: number; // Number of posts in the group
  follower_status: string | null; // Current user's follower status: 'active', 'pending', 'banned', or null
  // Note: description is NOT included in GroupPublicListItem (only in GroupResponse)
}

export interface GroupPublicListResponse {
  items: GroupPublicListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GroupError {
  detail: string;
}
