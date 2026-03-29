/**
 * Group-related types matching backend schemas
 */
import type { TagSummary } from "./tags";

/** User-created vs auto-created fixture discussion group */
export type GroupType = "user" | "fixture";

/** Embedded on GroupResponse for `group_type === "fixture"` */
export interface FixtureMeta {
  api_fixture_id: number;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  league_name: string | null;
  league_logo: string | null;
  match_date: string;
  status: string;
}

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
  owner_id: number | null;
  group_type: GroupType;
  fixture_id: number | null;
  created_at: string;
  member_count: number; // Number of members in the group (backend returns this, not members array)
  total_likes: number; // Total likes on all group posts
  total_dislikes: number; // Total dislikes on all group posts
  post_count: number; // Number of posts in the group
  comment_count: number; // Number of comments on group posts
  pending_count: number | null; // Number of pending followers (owner/admin only, null for regular users)
  tags: TagSummary[]; // Associated tags
  fixture_meta: FixtureMeta | null;
}

export interface GroupListItem extends GroupBase {
  id: number;
  owner_id: number | null;
  group_type: GroupType;
  /** Internal fixture row id when `group_type === "fixture"`; null for user groups */
  fixture_id: number | null;
  created_at: string;
  is_owner: boolean; // Whether the current user is the owner of this group
  // Note: GroupListItem does NOT include member_count (only in GroupResponse)
}

/** User profile groups list: no description or fixture_id (backend GroupListItemWithCounts does not extend GroupListItem). */
export interface GroupListItemWithCounts {
  id: number;
  name: string;
  icon_url: string | null;
  is_private: boolean;
  owner_id: number | null;
  group_type: GroupType;
  created_at: string;
  is_owner: boolean;
  member_count: number;
  post_count: number;
}

export interface GroupListWithCountsResponse {
  items: GroupListItemWithCounts[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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

export interface GroupPublicListItem {
  id: number;
  name: string;
  icon_url: string | null;
  is_private: boolean;
  owner_id: number | null;
  group_type: GroupType;
  created_at: string;
  member_count: number; // Number of members in the group (included in public list)
  post_count: number; // Number of posts in the group
  follower_status: "active" | "pending" | "banned" | null; // Current user's follower status
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
