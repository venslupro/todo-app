// core/services/websocket-service.ts
import {WebSocketErrors} from '../../shared/errors/websocket-errors';
import {SupabaseClient} from '../../shared/supabase/client';

/**
 * WebSocket消息接口
 */
interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  sender: string;
}

/**
 * WebSocket服务类
 */
export class WebSocketService {
  constructor() {}

  /**
   * 验证WebSocket连接
   */
  async authenticateConnection(token: string, env: any): Promise<any> {
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
   * 验证TODO访问权限
   */
  async verifyTodoAccess(
    todoId: string,
    userId: string,
    env: any,
  ): Promise<boolean> {
    const supabase = SupabaseClient.getClient(env);

    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (!todo) {
      return false;
    }

    // 如果是创建者，允许访问
    if ((todo as any).created_by === userId) {
      return true;
    }

    // 检查是否有分享权限
    const {data: share} = await supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return !!share;
  }

  /**
   * 广播消息给TODO房间的所有用户
   */
  async broadcastToTodoRoom(
    todoId: string,
    message: WebSocketMessage,
    excludeUserId?: string,
  ): Promise<void> {
    // 这里应该实现向WebSocket连接广播消息的逻辑
    // 由于我们使用Durable Objects，这个逻辑会在Durable Object内部实现
    // 这个方法主要是为了服务层的接口一致性
    console.log(`Broadcasting to todo room ${todoId}:`, {
      type: message.type,
      sender: message.sender,
      exclude: excludeUserId,
    });
  }

  /**
   * 处理TODO更新消息
   */
  async handleTodoUpdate(
    todoId: string,
    updateData: any,
    userId: string,
    env: any,
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
      console.error('WebSocket update error:', error);
      throw new Error('Failed to update todo');
    }
  }

  /**
   * 获取TODO房间的用户列表
   */
  async getTodoRoomUsers(todoId: string, env: any): Promise<any[]> {
    const supabase = SupabaseClient.getClient(env);

    // 获取所有有权限访问这个TODO的用户
    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .single();

    if (!todo) {
      return [];
    }

    // 获取创建者信息
    const creatorResponse = await supabase.auth.admin.getUserById((todo as any).created_by);

    // 获取分享用户
    const sharesResponse = await supabase
      .from('todo_shares')
      .select('user_id')
      .eq('todo_id', todoId);

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
        const userResponse = await supabase.auth.admin.getUserById((share as any).user_id);
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
    env: any,
  ): Promise<boolean> {
    const supabase = SupabaseClient.getClient(env);

    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (!todo) {
      return false;
    }

    // 如果是创建者，允许编辑
    if ((todo as any).created_by === userId) {
      return true;
    }

    // 检查是否有编辑权限的分享
    const {data: share} = await supabase
      .from('todo_shares')
      .select('permission')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return (share as any)?.permission === 'edit';
  }
}
