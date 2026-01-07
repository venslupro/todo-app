import type { User, Todo, Team, TodoStatus, Priority } from '../shared/types';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

export interface Session {
  user: AuthUser;
  access_token: string;
  expires_at?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreateTodoRequest {
  name: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  tags?: string[];
  assigneeId?: string;
  teamId?: string;
}

export interface UpdateTodoRequest {
  name?: string;
  description?: string;
  dueDate?: string;
  status?: TodoStatus;
  priority?: Priority;
  tags?: string[];
  assigneeId?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface AddTeamMemberRequest {
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}