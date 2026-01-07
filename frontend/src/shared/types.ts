export enum TodoStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  status: TodoStatus;
  priority: Priority;
  tags: string[];
  assignee_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  name: string;
  description?: string;
  due_date?: string;
  status?: TodoStatus;
  priority?: Priority;
  tags?: string[];
  assignee_id?: string;
  team_id?: string;
}

export interface UpdateTodoRequest {
  name?: string;
  description?: string;
  due_date?: string;
  status?: TodoStatus;
  priority?: Priority;
  tags?: string[];
  assignee_id?: string;
  team_id?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface Media {
  id: string;
  todo_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface FileUploadResponse {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}