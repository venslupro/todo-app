// src/types/index.ts
// Core data type definitions for the application

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  name: string;
  description?: string | null;
  due_date?: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  parent_id?: string | null;
  is_deleted: boolean;
}

export interface Media {
  id: string;
  todo_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video';
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TodoShare {
  id: string;
  todo_id: string;
  user_id: string;
  permission: 'view' | 'edit';
  shared_by: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface TodoFilterOptions extends PaginationOptions {
  status?: Todo['status'];
  priority?: Todo['priority'];
  due_date_before?: string;
  due_date_after?: string;
  tags?: string[];
  search?: string;
  sort_by?: keyof Todo;
  sort_order?: 'asc' | 'desc';
}

export interface MediaFilterOptions extends PaginationOptions {
  todo_id?: string;
  media_type?: Media['media_type'];
}

export interface TeamMember {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
  permission: 'view' | 'edit';
  shared_at: string;
}
