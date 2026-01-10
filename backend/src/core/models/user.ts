// core/models/user.ts
/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * 用户数据模型
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
 * 用户会话
 */
export interface UserSession {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string | undefined;
    expires_in: number;
  };
}

/**
 * 用户注册DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

/**
 * 用户登录DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}
