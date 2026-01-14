// core/models/user.ts
/**
 * User role enumeration
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * User data model
 */
export interface User {
  id: string;
  email: string;
  username: string | undefined;
  full_name: string | undefined;
  avatar_url: string | undefined;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * User session
 */
export interface UserSession {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  user: User;
  session: {
    access_token: string;
    refresh_token: string | undefined;
    expires_in: number;
  };
}

/**
 * User registration data
 */
export interface Register {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

/**
 * User login data
 */
export interface Login {
  email: string;
  password: string;
}
