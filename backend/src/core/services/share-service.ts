// core/services/share-service.ts
import {HttpErrors} from '../../shared/errors/http-errors';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../supabase/client';
import {
  TodoShare,
  // SharePermission,
  CreateShareDto,
  UpdateShareDto,
  ShareQueryParams,
} from '../models/share';

/**
 * Share service class
 */
export class ShareService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(env: Record<string, unknown>) {
    this.supabase = SupabaseClient.getClient(env as any);
  }

  /**
   * Share TODO with other users
   */
  async createShare(
    userId: string,
    dto: CreateShareDto,
  ): Promise<TodoShare> {
    Validator.validateUUID(dto.todo_id, 'todo_id');
    Validator.validateUUID(dto.user_id, 'user_id');
    const permission = Validator.validateSharePermission(dto.permission);

    // Cannot share with yourself
    if (dto.user_id === userId) {
      throw new HttpErrors.ValidationError('Cannot share with yourself');
    }

    // Check if TODO exists and belongs to current user
    const {data: todo} = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', dto.todo_id)
      .eq('is_deleted', false)
      .single();

    if (!todo) {
      throw new HttpErrors.NotFoundError('Todo not found');
    }

    if ((todo as {created_by: string}).created_by !== userId) {
      throw new HttpErrors.ForbiddenError('You can only share your own todos');
    }

    // Check if target user exists
    const {data: targetUser} = await this.supabase.auth.admin.getUserById(dto.user_id);

    if (!targetUser) {
      throw new HttpErrors.NotFoundError('Target user not found');
    }

    // Check if already shared
    const {data: existingShare} = await this.supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', dto.todo_id)
      .eq('user_id', dto.user_id)
      .single();

    if (existingShare) {
      throw new HttpErrors.ConflictError('Todo already shared with this user');
    }

    // Create share
    const shareData = {
      todo_id: dto.todo_id,
      user_id: dto.user_id,
      permission,
      shared_by: userId,
    };

    const {data, error} = await (this.supabase as any)
      .from('todo_shares')
      .insert(shareData)
      .select()
      .single();

    if (error) {
      throw new HttpErrors.InternalServerError(`Failed to create share: ${error.message}`);
    }

    return data as TodoShare;
  }

  /**
   * Get share list
   */
  async getShares(
    userId: string,
    params: ShareQueryParams,
  ): Promise<TodoShare[]> {
    let query = this.supabase
      .from('todo_shares')
      .select('*')
      .order('created_at', {ascending: false});

    // Apply filters
    if (params.todo_id) {
      Validator.validateUUID(params.todo_id, 'todo_id');

      // Check if user has permission to view shares for this TODO
      const {data: todo} = await this.supabase
        .from('todos')
        .select('created_by')
        .eq('id', params.todo_id)
        .eq('is_deleted', false)
        .single();

      if (!todo) {
        throw new HttpErrors.NotFoundError('Todo not found');
      }

      if ((todo as {created_by: string}).created_by !== userId) {
        throw new HttpErrors.ForbiddenError('You can only view shares of your own todos');
      }

      query = query.eq('todo_id', params.todo_id);
    }

    if (params.user_id) {
      Validator.validateUUID(params.user_id, 'user_id');
      query = query.eq('user_id', params.user_id);
    }

    if (params.permission) {
      query = query.eq('permission', params.permission);
    }

    // Apply pagination
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const {data, error} = await query;

    if (error) {
      throw new HttpErrors.InternalServerError(`Failed to fetch shares: ${error.message}`);
    }

    return data as TodoShare[];
  }

  /**
   * Get single share
   */
  async getShare(shareId: string, userId: string): Promise<TodoShare> {
    Validator.validateUUID(shareId, 'share_id');

    const {data: share, error} = await this.supabase
      .from('todo_shares')
      .select('*, todos!inner(created_by)')
      .eq('id', shareId)
      .single();

    if (error || !share) {
      throw new HttpErrors.NotFoundError('Share not found');
    }

    // Check permissions
    if (((share as {todos: {created_by: string}, user_id: string}).todos.created_by !== userId) &&
        ((share as {todos: {created_by: string}, user_id: string}).user_id !== userId)) {
      throw new HttpErrors.ForbiddenError('No permission to view this share');
    }

    return share as TodoShare;
  }

  /**
   * Update share permissions
   */
  async updateShare(
    shareId: string,
    userId: string,
    dto: UpdateShareDto,
  ): Promise<TodoShare> {
    Validator.validateUUID(shareId, 'share_id');
    const permission = Validator.validateSharePermission(dto.permission);

    // Get share information
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('*, todos!inner(created_by)')
      .eq('id', shareId)
      .single();

    if (!share) {
      throw new HttpErrors.NotFoundError(
        'Share not found',
      );
    }

    // Check permissions
    if (((share as {todos: {created_by: string}}).todos.created_by !== userId)) {
      throw new HttpErrors.ForbiddenError('You can only update shares of your own todos');
    }

    // Update share permissions
    const {data, error} = await (this.supabase as any)
      .from('todo_shares')
      .update({
        permission,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shareId)
      .select()
      .single();

    if (error) {
      throw new HttpErrors.InternalServerError(`Failed to update share: ${error.message}`);
    }

    return data as TodoShare;
  }

  /**
   * Delete share
   */
  async deleteShare(shareId: string, userId: string): Promise<void> {
    Validator.validateUUID(shareId, 'share_id');

    // Get share information
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('*, todos!inner(created_by)')
      .eq('id', shareId)
      .single();

    if (!share) {
      throw new HttpErrors.NotFoundError('Share not found');
    }

    // Check permissions
    if (((share as {todos: {created_by: string}, shared_by: string}).todos.created_by !== userId) &&
        ((share as {todos: {created_by: string}, shared_by: string}).shared_by !== userId)) {
      throw new HttpErrors.ForbiddenError('You can only delete shares you created or received');
    }

    const {error} = await (this.supabase as any)
      .from('todo_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      throw new HttpErrors.InternalServerError(`Failed to delete share: ${error.message}`);
    }
  }
}
