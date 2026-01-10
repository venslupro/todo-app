// core/services/todo-service.ts
import {HttpErrors} from '../../shared/errors/http-errors';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../../shared/supabase/client';
import {
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  TodoQueryParams,
  TodoListResponse,
  TodoStatus,
  TodoPriority,
} from '../models/todo';

/**
 * TODO service class
 */
export class TodoService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(env: any) {
    this.supabase = SupabaseClient.getClient(env);
  }

  /**
   * Get TODO list
   */
  async getTodos(
    userId: string,
    params: TodoQueryParams,
  ): Promise<TodoListResponse> {
    // Build query - get user created and shared TODOs
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
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to fetch todos');
    }

    return {
      todos: data as Todo[],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Create TODO
   */
  async createTodo(
    userId: string,
    dto: CreateTodoDto,
  ): Promise<Todo> {
    const todoData: any = {
      name: Validator.sanitizeString(dto.name, 200),
      description: dto.description ?
        Validator.sanitizeString(dto.description, 1000) :
        null,
      status: dto.status || TodoStatus.NOT_STARTED,
      priority: dto.priority || TodoPriority.MEDIUM,
      tags: dto.tags || null,
      created_by: userId,
    };

    if (dto.due_date) {
      Validator.validateDate(dto.due_date, 'due_date');
      todoData.due_date = dto.due_date;
    }

    if (dto.parent_id) {
      Validator.validateUUID(dto.parent_id, 'parent_id');

      // Verify parent TODO exists and user has access
      const {data: parentTodo} = await this.supabase
        .from('todos')
        .select('id')
        .eq('id', dto.parent_id)
        .eq('is_deleted', false)
        .or(`created_by.eq.${userId},shares.user_id.eq.${userId}`)
        .single();

      if (!parentTodo) {
        throw new HttpErrors.NotFoundError('Parent todo not found or no access');
      }

      todoData.parent_id = dto.parent_id;
    }

    const {data, error} = await this.supabase
      .from('todos')
      .insert(todoData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to create todo');
    }

    return data as Todo;
  }

  /**
   * Get single TODO
   */
  async getTodo(todoId: string, userId: string): Promise<Todo> {
    Validator.validateUUID(todoId, 'todo_id');

    const {data: todo, error} = await this.supabase
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (error || !todo) {
      throw new HttpErrors.NotFoundError('Todo not found');
    }

    // Check permissions
    const canAccess = await this.checkTodoAccess(todoId, userId);
    if (!canAccess) {
      throw new HttpErrors.ForbiddenError('No access to this todo');
    }

    return todo as Todo;
  }

  /**
   * Update TODO
   */
  async updateTodo(
    todoId: string,
    userId: string,
    dto: UpdateTodoDto,
  ): Promise<Todo> {
    Validator.validateUUID(todoId, 'todo_id');

    // Check edit permissions
    const canEdit = await this.checkEditPermission(todoId, userId);
    if (!canEdit) {
      throw new HttpErrors.ForbiddenError('No permission to edit this todo');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) {
      updateData.name = Validator.sanitizeString(dto.name, 200);
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description ?
        Validator.sanitizeString(dto.description, 1000) :
        null;
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
      updateData.due_date = dto.due_date ?
        Validator.validateDate(dto.due_date, 'due_date').toISOString() :
        null;
    }

    if (dto.parent_id !== undefined) {
      if (dto.parent_id) {
        Validator.validateUUID(dto.parent_id, 'parent_id');

        // Verify parent TODO exists and user has access
        const {data: parentTodo} = await this.supabase
          .from('todos')
          .select('id')
          .eq('id', dto.parent_id)
          .eq('is_deleted', false)
          .or(`created_by.eq.${userId},shares.user_id.eq.${userId}`)
          .single();

        if (!parentTodo) {
          throw new HttpErrors.NotFoundError('Parent todo not found or no access');
        }

        // Check for circular references
        if (dto.parent_id === todoId) {
          throw new HttpErrors.ValidationError('Cannot set todo as its own parent');
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
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to update todo');
    }

    return data as Todo;
  }

  /**
   * Delete TODO (soft delete)
   */
  async deleteTodo(todoId: string, userId: string): Promise<void> {
    Validator.validateUUID(todoId, 'todo_id');

    // Check if user is the creator
    const todoResponse = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    const todo = todoResponse.data as any;

    if (!todo) {
      throw new HttpErrors.NotFoundError('Todo not found');
    }

    if (todo.created_by !== userId) {
      throw new HttpErrors.ForbiddenError('Only creator can delete todo');
    }

    const {error} = await (this.supabase as any)
      .from('todos')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todoId);

    if (error) {
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to delete todo');
    }
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
    if ((data as any).created_by === userId) return true;

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
    if ((todo as any).created_by === userId) return true;

    // Check if user has edit permission through sharing
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('permission')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return (share as any)?.permission === 'edit';
  }
}
