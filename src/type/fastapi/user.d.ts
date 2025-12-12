export interface User {
  id: number;
  username: string;
  email: string;
  email_verified: boolean;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null; // Optional - can be null for newly created users
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthError {
  detail: string;
}
