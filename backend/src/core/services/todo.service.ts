import { TodoDriver, SupabaseDriver } from '../../drivers/supabase';
import { Todo, TodoListResponse } from '../model/todo';
import { CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../../shared/types/todo';
import { PaginationParams } from '../../shared/types/common';
import { AppException } from '../../shared/exceptions/app.exception';

export class TodoService {
  private readonly todoDriver: TodoDriver;

  constructor(supabaseDriver: SupabaseDriver) {
    this.todoDriver = new TodoDriver(supabaseDriver);
  }

  async getAllTodos(userId: string, filters?: TodoFilter, pagination?: PaginationParams): Promise<TodoListResponse> {
    const result = await this.todoDriver.getAllTodos(userId, filters, pagination);

    return {
      todos: result.todos.map((todo: any) => this.mapTodo(todo)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getTodoById(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoDriver.getTodoById(id, userId);
    if (!todo) {
      throw AppException.notFound('TODO not found', { id, userId });
    }
    return this.mapTodo(todo);
  }

  async createTodo(request: CreateTodoRequest, userId: string): Promise<Todo> {
    const todoData = {
      name: request.name,
      description: request.description,
      status: request.status,
      priority: request.priority,
      due_date: request.dueDate,
      tags: request.tags,
      parent_id: request.parentId,
    };

    const todo = await this.todoDriver.createTodo(todoData, userId);
    return this.mapTodo(todo);
  }

  async updateTodo(id: string, request: UpdateTodoRequest, userId: string): Promise<Todo> {
    const todoData: any = {
      ...request,
    };

    if (request.status === 'completed' && !todoData.completed_at) {
      todoData.completed_at = new Date().toISOString();
    } else if (request.status !== 'completed' && todoData.completed_at) {
      todoData.completed_at = null;
    }

    const todo = await this.todoDriver.updateTodo(id, todoData, userId);
    if (!todo) {
      throw AppException.notFound('TODO not found', { id, userId });
    }
    return this.mapTodo(todo);
  }

  async deleteTodo(id: string, userId: string): Promise<void> {
    const todo = await this.todoDriver.getTodoById(id, userId);
    if (!todo) {
      throw AppException.notFound('TODO not found', { id, userId });
    }
    await this.todoDriver.deleteTodo(id, userId);
  }

  private mapTodo(supabaseTodo: any): Todo {
    return {
      id: supabaseTodo.id,
      name: supabaseTodo.name,
      description: supabaseTodo.description,
      status: supabaseTodo.status,
      priority: supabaseTodo.priority,
      dueDate: supabaseTodo.due_date,
      tags: supabaseTodo.tags,
      createdBy: supabaseTodo.created_by,
      createdAt: supabaseTodo.created_at,
      updatedAt: supabaseTodo.updated_at,
      completedAt: supabaseTodo.completed_at,
      parentId: supabaseTodo.parent_id,
      isDeleted: supabaseTodo.is_deleted,
    };
  }
}
