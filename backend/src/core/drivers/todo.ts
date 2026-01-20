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
      this.logger.debug('TodoDriver: Creating new todo', {name: data.name, createdBy: data.created_by});
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
        this.logger.error('TodoDriver: Create todo failed', {name: data.name, createdBy: data.created_by, error: error.message});
        return err(new Error(`Create todo failed: ${error.message}`));
      }

      this.logger.debug('TodoDriver: Todo created successfully', {todoId: todo.id, name: todo.name});
      return ok(todo as Todo);
    } catch (error) {
      this.logger.error('TodoDriver: Create todo error', {name: data.name, createdBy: data.created_by, error: (error as Error).message});
      return err(new Error(`Create todo error: ${(error as Error).message}`));
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
        return err(new Error(`Get todo by ID failed: ${error.message}`));
      }

      this.logger.debug('TodoDriver: Got todo by ID successfully', {todoId, name: todo.name});
      return ok(todo as Todo);
    } catch (error) {
      this.logger.error('TodoDriver: Get todo by ID error', {todoId, error: (error as Error).message});
      return err(new Error(`Get todo by ID error: ${(error as Error).message}`));
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
      let query = this.supabase
        .getAnonClient()
        .from('todos')
        .select('*', {count: 'exact'})
        .eq('is_deleted', false)
        .or(`created_by.eq.${userId},id.in.(${this.getSharedTodosQuery(userId)})`);

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
        return err(new Error(`Get todos failed: ${error.message}`));
      }

      this.logger.debug('TodoDriver: Got todos successfully', {userId, count: todos.length, total: count || 0});
      return ok({
        todos: todos as Todo[],
        total: count || 0,
      });
    } catch (error) {
      this.logger.error('TodoDriver: Get todos error', {userId, filters, error: (error as Error).message});
      return err(new Error(`Get todos error: ${(error as Error).message}`));
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
        this.logger.error('TodoDriver: Update todo failed', {todoId, updateData: data, error: error.message});
        return err(new Error(`Update todo failed: ${error.message}`));
      }

      this.logger.debug('TodoDriver: Todo updated successfully', {todoId, name: todo.name});
      return ok(todo as Todo);
    } catch (error) {
      this.logger.error('TodoDriver: Update todo error', {todoId, updateData: data, error: (error as Error).message});
      return err(new Error(`Update todo error: ${(error as Error).message}`));
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
        return err(new Error(`Delete todo failed: ${error.message}`));
      }

      this.logger.debug('TodoDriver: Todo deleted successfully (soft delete)', {todoId});
      return ok(true);
    } catch (error) {
      this.logger.error('TodoDriver: Delete todo error', {todoId, error: (error as Error).message});
      return err(new Error(`Delete todo error: ${(error as Error).message}`));
    }
  }

  /**
   * Get shared todos subquery for the user
   */
  private getSharedTodosQuery(userId: string): string {
    return `(SELECT todo_id FROM todo_shares WHERE user_id = '${userId}')`;
  }
}

export const createTodoDriver = (options: TodoDriverOptions): TodoDriver => {
  return new TodoDriver(options);
};
