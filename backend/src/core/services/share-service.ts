// core/services/share-service.ts
import {HttpErrors} from '../../shared/errors/http-errors';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../../shared/supabase/client';
import {
  TodoShare,
  // SharePermission,
  CreateShareDto,
  UpdateShareDto,
  ShareQueryParams,
} from '../models/share';

/**
 * 分享服务类
 */
export class ShareService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(env: any) {
    this.supabase = SupabaseClient.getClient(env);
  }

  /**
   * 分享TODO给其他用户
   */
  async createShare(
    userId: string,
    dto: CreateShareDto,
  ): Promise<TodoShare> {
    Validator.validateUUID(dto.todo_id, 'todo_id');
    Validator.validateUUID(dto.user_id, 'user_id');
    const permission = Validator.validateSharePermission(dto.permission);

    // 不能分享给自己
    if (dto.user_id === userId) {
      throw new HttpErrors.ValidationError('Cannot share with yourself');
    }

    // 检查TODO是否存在且属于当前用户
    const {data: todo} = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', dto.todo_id)
      .eq('is_deleted', false)
      .single();

    if (!todo) {
      throw new HttpErrors.NotFoundError('Todo not found');
    }

    if ((todo as any).created_by !== userId) {
      throw new HttpErrors.ForbiddenError('You can only share your own todos');
    }

    // 检查目标用户是否存在
    const {data: targetUser} = await this.supabase.auth.admin.getUserById(dto.user_id);

    if (!targetUser) {
      throw new HttpErrors.NotFoundError('Target user not found');
    }

    // 检查是否已经分享过
    const {data: existingShare} = await this.supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', dto.todo_id)
      .eq('user_id', dto.user_id)
      .single();

    if (existingShare) {
      throw new HttpErrors.ConflictError('Todo already shared with this user');
    }

    // 创建分享
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
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to create share');
    }

    return data as TodoShare;
  }

  /**
   * 获取分享列表
   */
  async getShares(
    userId: string,
    params: ShareQueryParams,
  ): Promise<TodoShare[]> {
    let query = this.supabase
      .from('todo_shares')
      .select('*')
      .order('created_at', {ascending: false});

    // 应用过滤器
    if (params.todo_id) {
      Validator.validateUUID(params.todo_id, 'todo_id');

      // 检查用户是否有权限查看这个TODO的分享
      const {data: todo} = await this.supabase
        .from('todos')
        .select('created_by')
        .eq('id', params.todo_id)
        .eq('is_deleted', false)
        .single();

      if (!todo) {
        throw new HttpErrors.NotFoundError('Todo not found');
      }

      if ((todo as any).created_by !== userId) {
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

    // 应用分页
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const {data, error} = await query;

    if (error) {
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to fetch shares');
    }

    return data as TodoShare[];
  }

  /**
   * 获取单个分享
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

    // 检查权限
    if ((share as any).todos.created_by !== userId && (share as any).user_id !== userId) {
      throw new HttpErrors.ForbiddenError('No permission to view this share');
    }

    return share as TodoShare;
  }

  /**
   * 更新分享权限
   */
  async updateShare(
    shareId: string,
    userId: string,
    dto: UpdateShareDto,
  ): Promise<TodoShare> {
    Validator.validateUUID(shareId, 'share_id');
    const permission = Validator.validateSharePermission(dto.permission);

    // 获取分享信息
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

    // 检查权限
    if ((share as any).todos.created_by !== userId) {
      throw new HttpErrors.ForbiddenError('You can only update shares of your own todos');
    }

    // 更新分享权限
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
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to update share');
    }

    return data as TodoShare;
  }

  /**
   * 删除分享
   */
  async deleteShare(shareId: string, userId: string): Promise<void> {
    Validator.validateUUID(shareId, 'share_id');

    // 获取分享信息
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('*, todos!inner(created_by)')
      .eq('id', shareId)
      .single();

    if (!share) {
      throw new HttpErrors.NotFoundError('Share not found');
    }

    // 检查权限
    if ((share as any).todos.created_by !== userId && (share as any).shared_by !== userId) {
      throw new HttpErrors.ForbiddenError('You can only delete shares you created or received');
    }

    const {error} = await (this.supabase as any)
      .from('todo_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to delete share');
    }
  }
}
