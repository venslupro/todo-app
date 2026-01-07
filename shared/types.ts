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
  team_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joined_at: string;
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

export interface ListTodosRequest {
  status?: string;
  priority?: string;
  due_date_from?: string;
  due_date_to?: string;
  tags?: string;
  assignee_id?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface ListTodosResponse {
  todos: Todo[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface AddTeamMemberRequest {
  user_id: string;
  role?: 'MEMBER' | 'ADMIN';
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  created_at: string;
}