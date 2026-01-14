// core/models/todo.ts
/**
 * TODO item status enumeration
 */
export enum TodoStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * TODO item priority enumeration
 */
export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * TODO item data model
 */
export interface Todo {
  id: string;
  name: string;
  description: string | null;
  due_date: string | null; // ISO 8601 format
  status: TodoStatus;
  priority: TodoPriority | null;
  tags: string[] | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  parent_id: string | null; // For subtasks
  is_deleted: boolean;
}

/**
 * Create TODO data
 */
export interface CreateTodo {
  name: string;
  description?: string;
  due_date?: string;
  priority: TodoPriority;
  status: TodoStatus;
  tags?: string[];
  parent_id?: string;
}

/**
 * Update TODO data
 */
export interface UpdateTodo {
  name?: string;
  description?: string;
  due_date?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  tags?: string[];
  parent_id?: string;
}

/**
 * TODO query parameters
 */
export interface TodoQueryParams {
  status: TodoStatus | undefined;
  priority: TodoPriority | undefined;
  due_date_before: string | undefined;
  due_date_after: string | undefined;
  tags: string[] | undefined;
  search: string | undefined;
  limit: number | undefined;
  offset: number | undefined;
  sort_by: 'due_date' | 'created_at' | 'updated_at' | 'priority' | 'name' | undefined;
  sort_order: 'asc' | 'desc' | undefined;
}

/**
 * TODO list result
 */
export interface TodoListResult {
  todos: Todo[];
  total: number;
  limit: number;
  offset: number;
}
