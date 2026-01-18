import { TodoDriver, SupabaseDriver } from '../../drivers/supabase';
import { Todo, TodoListResponse } from '../model/todo';
import { CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../../shared/types/todo';
import { PaginationParams, ApiError } from '../../shared/types/common';

export class TodoService {
  private todoDriver: TodoDriver;

  constructor(supabaseDriver: SupabaseDriver) {
    this.todoDriver = new TodoDriver(supabaseDriver);
  }

  async getAllTodos(userId: string, filters?: TodoFilter, pagination?: PaginationParams): Promise<TodoListResponse> {
    try {
      const result = await this.todoDriver.getAllTodos(userId, filters, pagination);

      return {
        todos: result.todos.map((todo: any) => this.mapTodo(todo)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async getTodoById(id: string, userId: string): Promise<Todo> {
    try {
      const todo = await this.todoDriver.getTodoById(id, userId);
      return this.mapTodo(todo);
    } catch (error: any) {
      if (error.code === 'PGRST116') {
        throw {
          code: 404,
          message: 'Not Found',
          details: 'TODO not found',
        } as ApiError;
      }
      throw this.mapError(error);
    }
  }

  async createTodo(request: CreateTodoRequest, userId: string): Promise<Todo> {
    try {
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
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async updateTodo(id: string, request: UpdateTodoRequest, userId: string): Promise<Todo> {
    try {
      const todoData: any = {
        ...request,
      };

      if (request.status === 'completed' && !todoData.completed_at) {
        todoData.completed_at = new Date().toISOString();
      } else if (request.status !== 'completed' && todoData.completed_at) {
        todoData.completed_at = null;
      }

      const todo = await this.todoDriver.updateTodo(id, todoData, userId);
      return this.mapTodo(todo);
    } catch (error: any) {
      if (error.code === 'PGRST116') {
        throw {
          code: 404,
          message: 'Not Found',
          details: 'TODO not found',
        } as ApiError;
      }
      throw this.mapError(error);
    }
  }

  async deleteTodo(id: string, userId: string): Promise<void> {
    try {
      await this.todoDriver.deleteTodo(id, userId);
    } catch (error: any) {
      if (error.code === 'PGRST116') {
        throw {
          code: 404,
          message: 'Not Found',
          details: 'TODO not found',
        } as ApiError;
      }
      throw this.mapError(error);
    }
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

  private mapError(error: any): ApiError {
    if (error.code === '23505') {
      return {
        code: 409,
        message: 'Conflict',
        details: 'TODO already exists',
      };
    }

    if (error.code === '23503') {
      return {
        code: 400,
        message: 'Bad Request',
        details: 'Invalid parent TODO reference',
      };
    }

    return {
      code: 500,
      message: 'Internal Server Error',
      details: error.message,
    };
  }
}
