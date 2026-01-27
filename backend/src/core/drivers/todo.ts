// src/drivers/todo.ts
// Todo driver for handling todo-related database operations

import {Result, err, ok} from 'neverthrow';
import {SupabaseDriver} from './supabase/supabase';
import {Todo, TodoFilterOptions} from '../models/types';
import {Logger} from '../../shared/utils/logger';

interface TodoDriverOptions {
  supabase: SupabaseDriver;
  logger: Logger;
}

export class TodoDriver {
  private readonly supabase: SupabaseDriver;
  private readonly logger: Logger;

  constructor(options: TodoDriverOptions) {
    this.supabase = options.supabase;
    this.logger = options.logger;
  }

  /**
   * Create a new todo
   */
  async createTodo(
    data: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>,
  ): Promise<Result<Todo, Error>> {
    try {
      this.logger.debug('TodoDriver: Creating todo', {name: data.name, createdBy: data.created_by});
      const {data: todo, error} = await this.supabase
        .getAnonClient()
        .from('todos')
        .insert({
          ...data,
          is_deleted: false,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('TodoDriver: Create failed', {name: data.name, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TodoDriver: Todo created', {todoId: todo.id, name: todo.name});
      return ok(todo as Todo);
    } catch (error) {
      this.logger.error('TodoDriver: Create error', {error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Get a todo by ID
   */
  async getTodoById(todoId: string): Promise<Result<Todo, Error>> {
    try {
      this.logger.debug('TodoDriver: Getting todo by ID', {todoId});
      const {data: todo, error} = await this.supabase
        .getAnonClient()
        .from('todos')
        .select()
        .eq('id', todoId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        this.logger.error('TodoDriver: Get todo by ID failed', {todoId, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TodoDriver: Got todo by ID', {todoId, name: todo.name});
      return ok(todo as Todo);
    } catch (error) {
      this.logger.error('TodoDriver: Get by ID error', {todoId, error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Get all todos with filtering options
   */
  async getTodos(
    userId: string,
    filters: TodoFilterOptions = {},
  ): Promise<Result<{ todos: Todo[]; total: number }, Error>> {
    try {
      this.logger.debug('TodoDriver: Getting todos for user', {userId, filters});

      // First, get all todo IDs that the user has access to (created by user or shared with user)
      const {data: sharedTodos, error: sharedTodosError} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .select('todo_id')
        .eq('user_id', userId);

      if (sharedTodosError) {
        const errorMsg = sharedTodosError.message;
        this.logger.error('TodoDriver: Get shared todos failed', {userId, error: errorMsg});
        return err(new Error(`${errorMsg}`));
      }

      // Get shared todo IDs as an array
      const sharedTodoIds = sharedTodos?.map((share) => share.todo_id) || [];

      // Build the or condition for created_by and shared todos
      let orCondition = `created_by.eq.${userId}`;
      if (sharedTodoIds.length > 0) {
        orCondition += `,id.in.(${sharedTodoIds.map((id) => `'${id}'`).join(',')})`;
      }

      // Build the query
      let query = this.supabase
        .getAnonClient()
        .from('todos')
        .select('*', {count: 'exact'})
        .eq('is_deleted', false)
        .or(orCondition);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.due_date_before) {
        query = query.lt('due_date', filters.due_date_before);
      }

      if (filters.due_date_after) {
        query = query.gt('due_date', filters.due_date_after);
      }

      if (filters.tags && filters.tags.length > 0) {
        // Filter todos that have all the specified tags
        for (const tag of filters.tags) {
          query = query.overlaps('tags', `{${tag}}`);
        }
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }

      // Apply sorting
      if (filters.sort_by) {
        query = query.order(filters.sort_by, {
          ascending: filters.sort_order === 'asc',
        });
      } else {
        query = query.order('created_at', {ascending: false});
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const {data: todos, error, count} = await query;

      if (error) {
        this.logger.error('TodoDriver: Get todos failed', {userId, filters, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TodoDriver: Got todos', {userId, count: todos.length, total: count || 0});
      return ok({
        todos: todos as Todo[],
        total: count || 0,
      });
    } catch (error) {
      this.logger.error('TodoDriver: Get todos error', {userId, error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(
    todoId: string,
    data: Partial<Omit<Todo, 'id' | 'created_by' | 'created_at' | 'is_deleted'>>,
  ): Promise<Result<Todo, Error>> {
    try {
      this.logger.debug('TodoDriver: Updating todo', {todoId, updateData: data});
      // If status is completed and completed_at is not set, set it to now
      const updateData = {
        ...data,
        ...(data.status === 'completed' && {
          completed_at: new Date().toISOString(),
        }),
      };

      const {data: todo, error} = await this.supabase
        .getAnonClient()
        .from('todos')
        .update(updateData)
        .eq('id', todoId)
        .eq('is_deleted', false)
        .select()
        .single();

      if (error) {
        this.logger.error('TodoDriver: Update failed', {todoId, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TodoDriver: Todo updated', {todoId, name: todo.name});
      return ok(todo as Todo);
    } catch (error) {
      this.logger.error('TodoDriver: Update todo error', {todoId, error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Delete a todo (soft delete)
   */
  async deleteTodo(todoId: string): Promise<Result<boolean, Error>> {
    try {
      this.logger.debug('TodoDriver: Deleting todo (soft delete)', {todoId});
      const {error} = await this.supabase
        .getAnonClient()
        .from('todos')
        .update({is_deleted: true})
        .eq('id', todoId)
        .eq('is_deleted', false);

      if (error) {
        this.logger.error('TodoDriver: Delete todo failed', {todoId, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TodoDriver: Todo deleted (soft)', {todoId});
      return ok(true);
    } catch (error) {
      this.logger.error('TodoDriver: Delete todo error', {todoId, error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }
}

export const createTodoDriver = (options: TodoDriverOptions): TodoDriver => {
  return new TodoDriver(options);
};
