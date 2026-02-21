export interface User {
  id: number;
  username: string;
  email: string;
  email_verified: boolean;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null; // Optional - can be null for newly created users
  role?: string; // From backend UserResponse (e.g. "user", "admin")
}

/** Public user profile by ID (GET /api/v1/users/{user_id}). Includes counts; no email, role, or is_active. */
export interface UserPublicResponse {
  id: number;
  username: string;
  avatar_url: string | null;
  created_at: string;
  post_count: number;
  group_count: number;
  comment_count: number;
  total_likes: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthError {
  detail: string;
}
