// core/services/share-service.ts
import {ErrorCode, Result, okResult, errResult} from '../../shared/errors/error-codes';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../supabase/client';
import {ConflictException, InternalServerException} from '../../shared/errors/http-exception';
import {AppConfig} from '../../shared/config/app-config';
import {
  TodoShare,
  // SharePermission,
  CreateShare,
  UpdateShare,
  ShareQueryParams,
} from '../models/share';

/**
 * Share service class
 */
export class ShareService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(config: AppConfig) {
    this.supabase = SupabaseClient.getClient(config);
  }

  /**
   * Share TODO with other users
   */
  async createShare(
    userId: string,
    dto: CreateShare,
  ): Promise<Result<TodoShare, ErrorCode>> {
    const todoIdResult = Validator.validateUUID(dto.todo_id);
    if (todoIdResult.isErr()) {
      return errResult(todoIdResult.error);
    }

    const userIdResult = Validator.validateUUID(dto.user_id);
    if (userIdResult.isErr()) {
      return errResult(userIdResult.error);
    }

    const permissionResult = Validator.validateSharePermission(dto.permission);
    if (permissionResult.isErr()) {
      return errResult(permissionResult.error);
    }
    const permission = permissionResult.value;

    // Cannot share with yourself
    if (dto.user_id === userId) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    // Check if TODO exists and belongs to current user
    const {data: todo} = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', dto.todo_id)
      .eq('is_deleted', false)
      .single();

    if (!todo) {
      return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
    }

    if ((todo as {created_by: string}).created_by !== userId) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    // Check if target user exists
    const {data: targetUser} = await this.supabase.auth.admin.getUserById(dto.user_id);

    if (!targetUser) {
      return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
    }

    // Check if already shared
    const {data: existingShare} = await this.supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', dto.todo_id)
      .eq('user_id', dto.user_id)
      .single();

    if (existingShare) {
      throw new ConflictException('Todo already shared with this user');
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
      throw new InternalServerException(`Failed to create share: ${error.message}`);
    }

    return okResult(data as TodoShare);
  }

  /**
   * Get share list
   */
  async getShares(
    userId: string,
    params: ShareQueryParams,
  ): Promise<Result<TodoShare[], ErrorCode>> {
    let query = this.supabase
      .from('todo_shares')
      .select('*')
      .order('created_at', {ascending: false});

    // Apply filters
    if (params.todo_id) {
      Validator.validateUUID(params.todo_id);

      // Check if user has permission to view shares for this TODO
      const {data: todo} = await this.supabase
        .from('todos')
        .select('created_by')
        .eq('id', params.todo_id)
        .eq('is_deleted', false)
        .single();

      if (!todo) {
        return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
      }

      if ((todo as {created_by: string}).created_by !== userId) {
        return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
      }

      query = query.eq('todo_id', params.todo_id);
    }

    if (params.user_id) {
      Validator.validateUUID(params.user_id);
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
      return errResult(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

    return okResult(data as TodoShare[]);
  }

  /**
   * Get single share
   */
  async getShare(shareId: string, userId: string): Promise<Result<TodoShare, ErrorCode>> {
    Validator.validateUUID(shareId);

    const {data: share, error} = await this.supabase
      .from('todo_shares')
      .select('*, todos!inner(created_by)')
      .eq('id', shareId)
      .single();

    if (error || !share) {
      return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
    }

    // Check permissions
    if (((share as {todos: {created_by: string}, user_id: string}).todos.created_by !== userId) &&
        ((share as {todos: {created_by: string}, user_id: string}).user_id !== userId)) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    return okResult(share as TodoShare);
  }

  /**
   * Update share permissions
   */
  async updateShare(
    shareId: string,
    userId: string,
    dto: UpdateShare,
  ): Promise<Result<TodoShare, ErrorCode>> {
    Validator.validateUUID(shareId);
    const permission = Validator.validateSharePermission(dto.permission);

    // Get share information
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('*, todos!inner(created_by)')
      .eq('id', shareId)
      .single();

    if (!share) {
      return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
    }

    // Check permissions
    if (((share as {todos: {created_by: string}}).todos.created_by !== userId)) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
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
      throw new InternalServerException(`Failed to update share: ${error.message}`);
    }

    return okResult(data as TodoShare);
  }

  /**
   * Delete share
   */
  async deleteShare(shareId: string, userId: string): Promise<Result<void, ErrorCode>> {
    const uuidResult = Validator.validateUUID(shareId);
    if (uuidResult.isErr()) {
      return errResult(uuidResult.error);
    }

    // Get share information
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('*, todos!inner(created_by)')
      .eq('id', shareId)
      .single();

    if (!share) {
      return errResult(ErrorCode.BUSINESS_RESOURCE_NOT_FOUND);
    }

    // Check permissions
    if (((share as {todos: {created_by: string}, shared_by: string}).todos.created_by !== userId) &&
        ((share as {todos: {created_by: string}, shared_by: string}).shared_by !== userId)) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    const {error} = await (this.supabase as any)
      .from('todo_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      return errResult(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

    return okResult(undefined);
  }
}
