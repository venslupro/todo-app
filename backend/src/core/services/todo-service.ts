import {ErrorCode, Result, okResult, errResult} from '../../shared/errors/error-codes';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../supabase/client';
import {AppConfig} from '../../shared/config/config';
import type {Database} from '../supabase/database.types';
import {
  Todo,
  CreateTodo,
  UpdateTodo,
  TodoQueryParams,
  TodoListResult,
  TodoStatus,
  TodoPriority,
} from '../models/todo';

/**
 * Service class for managing TODO operations.
 */
export class TodoService {
  private readonly supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(config: AppConfig) {
    this.supabase = SupabaseClient.getClient(config);
  }

  /**
   * Retrieves a list of TODOs for the specified user.
   */
  async getTodos(
    userId: string,
    params: TodoQueryParams,
  ): Promise<Result<TodoListResult, ErrorCode>> {
    let query = this.supabase
      .from('todos')
      .select('*', {count: 'exact'})
      .or(`created_by.eq.${userId},shares.user_id.eq.${userId}`)
      .eq('is_deleted', false);

    // Apply filters
    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.priority) {
      query = query.eq('priority', params.priority);
    }

    if (params.due_date_before) {
      query = query.lte('due_date', params.due_date_before);
    }

    if (params.due_date_after) {
      query = query.gte('due_date', params.due_date_after);
    }

    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags);
    }

    if (params.search) {
      const searchTerm = Validator.sanitizeString(params.search, 100);
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply sorting
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';
    query = query.order(sortBy, {ascending: sortOrder === 'asc'});

    // Apply pagination
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const {data, error, count} = await query;

    if (error) {
      return errResult(ErrorCode.DATABASE_QUERY_FAILED);
    }

    return okResult({
      todos: data as Todo[],
      total: count || 0,
      limit,
      offset,
    });
  }

  /**
   * Create TODO
   */
  async create(
    userId: string,
    dto: CreateTodo,
  ): Promise<Result<Todo, ErrorCode>> {
    const nameResult = Validator.sanitizeString(dto.name, 200);
    if (nameResult.isErr()) {
      return errResult(nameResult.error);
    }
    
    let descriptionValue: string | null = null;
    if (dto.description) {
      const descriptionResult = Validator.sanitizeString(dto.description, 1000);
      if (descriptionResult.isErr()) {
        return errResult(descriptionResult.error);
      }
      descriptionValue = descriptionResult.value;
    }
    
    const todoData: Database['public']['Tables']['todos']['Insert'] = {
      name: nameResult.value,
      description: descriptionValue,
      status: dto.status || TodoStatus.NOT_STARTED,
      priority: dto.priority || TodoPriority.MEDIUM,
      tags: dto.tags || null,
      created_by: userId,
    };

    if (dto.due_date) {
      Validator.validateDate(dto.due_date);
      todoData.due_date = dto.due_date;
    }

    if (dto.parent_id) {
      Validator.validateUUID(dto.parent_id);

      // Verify parent TODO exists and user has access
      const {data: parentTodo} = await this.supabase
        .from('todos')
        .select('id')
        .eq('id', dto.parent_id)
        .eq('is_deleted', false)
        .or(`created_by.eq.${userId},shares.user_id.eq.${userId}`)
        .single();

      if (!parentTodo) {
        return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
      }

      todoData.parent_id = dto.parent_id;
    }

    const {data, error} = await this.supabase
      .from('todos')
      .insert(todoData as any)
      .select()
      .single();

    if (error) {
      return errResult(ErrorCode.DATABASE_QUERY_FAILED);
    }

    return okResult(data as Todo);
  }

  /**
   * Get single TODO
   */
  async getTodo(todoId: string, userId: string): Promise<Result<Todo, ErrorCode>> {
    Validator.validateUUID(todoId);

    const {data: todo, error} = await this.supabase
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (error || !todo) {
      return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
    }

    // Check permissions
    const canAccess = await this.checkTodoAccess(todoId, userId);
    if (!canAccess) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    return okResult(todo as Todo);
  }

  /**
   * Update TODO
   */
  async updateTodo(
    todoId: string,
    userId: string,
    dto: UpdateTodo,
  ): Promise<Result<Todo, ErrorCode>> {
    Validator.validateUUID(todoId);

    // Check edit permissions
    const canEdit = await this.checkEditPermission(todoId, userId);
    if (!canEdit) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    const updateData: Partial<Todo> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) {
      const nameResult = Validator.sanitizeString(dto.name, 200);
      if (nameResult.isErr()) {
        return errResult(nameResult.error);
      }
      updateData.name = nameResult.value;
    }

    if (dto.description !== undefined) {
      if (dto.description) {
        const descriptionResult = Validator.sanitizeString(dto.description, 1000);
        if (descriptionResult.isErr()) {
          return errResult(descriptionResult.error);
        }
        updateData.description = descriptionResult.value;
      } else {
        updateData.description = null;
      }
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === TodoStatus.COMPLETED) {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
    }

    if (dto.priority !== undefined) {
      updateData.priority = dto.priority;
    }

    if (dto.tags !== undefined) {
      updateData.tags = dto.tags;
    }

    if (dto.due_date !== undefined) {
      if (dto.due_date) {
        const dateResult = Validator.validateDate(dto.due_date);
        if (dateResult.isErr()) {
          return errResult(dateResult.error);
        }
        updateData.due_date = dateResult.value.toISOString();
      } else {
        updateData.due_date = null;
      }
    }

    if (dto.parent_id !== undefined) {
      if (dto.parent_id) {
        Validator.validateUUID(dto.parent_id);

        // Verify parent TODO exists and user has access
        const {data: parentTodo} = await this.supabase
          .from('todos')
          .select('id')
          .eq('id', dto.parent_id)
          .eq('is_deleted', false)
          .or(`created_by.eq.${userId},shares.user_id.eq.${userId}`)
          .single();

        if (!parentTodo) {
          return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
        }

        // Check for circular references
        if (dto.parent_id === todoId) {
          return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
        }

        updateData.parent_id = dto.parent_id;
      } else {
        updateData.parent_id = null;
      }
    }

    const {data, error} = await (this.supabase as any)
      .from('todos')
      .update(updateData)
      .eq('id', todoId)
      .select()
      .single();

    if (error) {
      return errResult(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

    return okResult(data as Todo);
  }

  /**
   * Delete TODO (soft delete)
   */
  async deleteTodo(todoId: string, userId: string): Promise<Result<void, ErrorCode>> {
    const uuidResult = Validator.validateUUID(todoId);
    if (uuidResult.isErr()) {
      return errResult(uuidResult.error);
    }

    // Check if user is the creator
    const todoResponse = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    const todo = todoResponse.data as {created_by: string} | null;

    if (!todo) {
      return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
    }

    if (todo.created_by !== userId) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    const {error} = await (this.supabase as any)
      .from('todos')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todoId);

    if (error) {
      return errResult(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

    return okResult(undefined);
  }

  /**
   * Check TODO access permissions
   */
  private async checkTodoAccess(
    todoId: string,
    userId: string,
  ): Promise<boolean> {
    const {data} = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (!data) return false;

    // If user is the creator, allow access
    if ((data as {created_by: string}).created_by === userId) return true;

    // Check if user has share permissions
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return !!share;
  }

  /**
   * Check edit permissions
   */
  private async checkEditPermission(
    todoId: string,
    userId: string,
  ): Promise<boolean> {
    const {data: todo} = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (!todo) return false;

    // If user is the creator, allow editing
    if ((todo as {created_by: string}).created_by === userId) return true;

    // Check if user has edit permission through sharing
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('permission')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return (share as {permission: string} | null)?.permission === 'edit';
  }
}
