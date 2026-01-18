export type TodoStatus = 'not_started' | 'in_progress' | 'completed';
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Todo {
  id: string;
  name: string;
  description?: string | null;
  status: TodoStatus;
  priority?: TodoPriority | null;
  dueDate?: string | null;
  tags?: string[] | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  parentId?: string | null;
  isDeleted: boolean;
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
  limit: number;
  offset: number;
}