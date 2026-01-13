// core/services/websocket-service.ts
import {WebSocketErrors} from '../../shared/errors/websocket-errors';
import {SupabaseClient} from '../supabase/client';
import {AppConfig} from '../../shared/config/config';
import {Todo} from '../models/todo';

/**
 * WebSocket service class
 */
export class WebSocketService {
  constructor() {}

  /**
   * Authenticate WebSocket connection
   */
  async authenticateConnection(
    token: string,
    env: AppConfig,
  ): Promise<{ id: string; email?: string }> {
    if (!token) {
      throw new WebSocketErrors.WebSocketAuthError('Authentication token required');
    }

    const supabase = SupabaseClient.getClient(env);
    const {data: {user}, error} = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new WebSocketErrors.WebSocketAuthError('Invalid or expired token');
    }

    return user;
  }

  /**
   * Validate TODO access permissions
   */
  async verifyTodoAccess(
    todoId: string,
    userId: string,
    env: AppConfig,
  ): Promise<boolean> {
    const supabase = SupabaseClient.getClient(env);

    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single<{ created_by: string }>();

    if (!todo) {
      return false;
    }

    // If creator, allow access
    if (todo.created_by === userId) {
      return true;
    }

    // Check if there is share permission
    const {data: share} = await supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return !!share;
  }

  /**
   * Broadcast message to all users in TODO room
   */
  async broadcastToTodoRoom(): Promise<void> {
    // This should implement logic to broadcast messages to WebSocket connections
    // Since we use Durable Objects, this logic will be implemented inside the Durable Object
    // This method is mainly for service layer interface consistency
  }

  /**
   * Handle TODO update message
   */
  async handleTodoUpdate(
    todoId: string,
    updateData: Partial<Todo>,
    userId: string,
    env: AppConfig,
  ): Promise<void> {
    const supabase = SupabaseClient.getClient(env);

    // 检查编辑权限
    const canEdit = await this.checkEditPermission(todoId, userId, env);
    if (!canEdit) {
      throw new WebSocketErrors.WebSocketAuthError('No permission to edit this todo');
    }

    // 更新TODO
    const {error} = await (supabase as any)
      .from('todos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todoId);

    if (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
  }

  /**
   * 获取TODO房间的用户列表
   */
  async getTodoRoomUsers(
    todoId: string,
    env: AppConfig,
  ): Promise<Array<{
    id: string;
    email?: string | null | undefined;
    username?: string | null | undefined;
    full_name?: string | null | undefined;
    is_creator: boolean;
  }>> {
    const supabase = SupabaseClient.getClient(env);

    // 获取所有有权限访问这个TODO的用户
    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .single<{ created_by: string }>();

    if (!todo) {
      return [];
    }

    // 获取创建者信息
    const creatorResponse = await supabase.auth.admin.getUserById(todo.created_by);

    // 获取分享用户
    const sharesResponse = await supabase
      .from('todo_shares')
      .select('user_id')
      .eq('todo_id', todoId)
      .returns<Array<{ user_id: string }>>();

    const users = [];

    if (creatorResponse && creatorResponse.data && creatorResponse.data.user) {
      users.push({
        id: creatorResponse.data.user.id,
        email: creatorResponse.data.user.email,
        username: creatorResponse.data.user.user_metadata?.['username'],
        full_name: creatorResponse.data.user.user_metadata?.['full_name'],
        is_creator: true,
      });
    }

    // 获取分享用户的信息
    if (sharesResponse && sharesResponse.data && sharesResponse.data.length > 0) {
      for (const share of sharesResponse.data) {
        const userResponse = await supabase.auth.admin.getUserById(share.user_id);
        if (userResponse && userResponse.data && userResponse.data.user) {
          users.push({
            id: userResponse.data.user.id,
            email: userResponse.data.user.email,
            username: userResponse.data.user.user_metadata?.['username'],
            full_name: userResponse.data.user.user_metadata?.['full_name'],
            is_creator: false,
          });
        }
      }
    }

    return users;
  }

  /**
   * 检查编辑权限
   */
  private async checkEditPermission(
    todoId: string,
    userId: string,
    env: AppConfig,
  ): Promise<boolean> {
    const supabase = SupabaseClient.getClient(env);

    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single<{created_by: string}>();

    if (!todo) {
      return false;
    }

    // 如果是创建者，允许编辑
    if (todo.created_by === userId) {
      return true;
    }

    // 检查是否有编辑权限的分享
    const {data: share} = await supabase
      .from('todo_shares')
      .select('permission')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single<{permission: string}>();

    return share?.permission === 'edit';
  }
}
