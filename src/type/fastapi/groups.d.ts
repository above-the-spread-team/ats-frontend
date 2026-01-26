/**
 * Group-related types matching backend schemas
 */

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
}

export interface GroupUpdate {
  name?: string;
  description?: string | null;
  icon_url?: string | null;
  is_private?: boolean;
}

export interface GroupMemberResponse {
  user_id: number;
  joined_at: string;
}

export interface GroupMemberItem {
  id: number; // User ID
  username: string; // Member username
  avatar_url: string | null; // Member avatar URL
}

export interface GroupMemberListResponse {
  items: GroupMemberItem[];
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
}

export interface GroupListItem extends GroupBase {
  id: number;
  owner_id: number;
  created_at: string;
  // Note: GroupListItem does NOT include member_count (only in GroupResponse)
}

export interface GroupMemberAddRequest {
  user_id: number;
}

export interface GroupListResponse {
  items: GroupListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GroupPublicListItem extends GroupBase {
  id: number;
  owner_id: number;
  created_at: string;
  member_count: number; // Number of members in the group (included in public list)
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
