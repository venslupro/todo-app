// core/models/todo.ts
/**
 * TODO项状态枚举
 */
export enum TodoStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * TODO项优先级枚举
 */
export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * TODO项数据模型
 */
export interface Todo {
  id: string;
  name: string;
  description: string | null;
  due_date: string | null; // ISO 8601格式
  status: TodoStatus;
  priority: TodoPriority | null;
  tags: string[] | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  parent_id: string | null; // 用于子任务
  is_deleted: boolean;
}

/**
 * 创建TODO的DTO
 */
export interface CreateTodoDto {
  name: string;
  description?: string;
  due_date?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  parent_id?: string;
}

/**
 * 更新TODO的DTO
 */
export interface UpdateTodoDto {
  name?: string;
  description?: string;
  due_date?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  parent_id?: string;
}

/**
 * TODO查询参数
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
 * TODO列表响应
 */
export interface TodoListResponse {
  todos: Todo[];
  total: number;
  limit: number;
  offset: number;
}
