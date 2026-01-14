// core/services/websocket-service.ts
import {ErrorCode, Result, okResult, errResult} from '../../shared/errors/error-codes';
import {SupabaseClient} from '../supabase/client';
import {AppConfig} from '../../shared/config/config';
import {Todo} from '../models/todo';

/**
 * WebSocket service class.
 */
export class WebSocketService {
  constructor() {}

  /**
   * Authenticates WebSocket connection.
   */
  async authenticateConnection(
    token: string,
    env: AppConfig,
  ): Promise<Result<{ id: string; email?: string }, ErrorCode>> {
    if (!token) {
      return errResult(ErrorCode.AUTH_TOKEN_INVALID);
    }

    const supabase = SupabaseClient.getClient(env);
    const {data: {user}, error} = await supabase.auth.getUser(token);

    if (error || !user) {
      return errResult(ErrorCode.AUTH_TOKEN_INVALID);
    }

    return okResult(user);
  }

  /**
   * Validates TODO access permissions.
   */
  async verifyTodoAccess(
    todoId: string,
    userId: string,
    env: AppConfig,
  ): Promise<Result<boolean, ErrorCode>> {
    const supabase = SupabaseClient.getClient(env);

    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single<{ created_by: string }>();

    if (!todo) {
      return okResult(false);
    }

    // If creator, allow access
    if (todo.created_by === userId) {
      return okResult(true);
    }

    // Check if there is share permission
    const {data: share} = await supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return okResult(!!share);
  }

  /**
   * Broadcasts message to all users in TODO room.
   */
  async broadcastToTodoRoom(): Promise<void> {
    // This should implement logic to broadcast messages to WebSocket connections
    // Since we use Durable Objects, this logic will be implemented inside the Durable Object
    // This method is mainly for service layer interface consistency
  }

  /**
   * Handles TODO update message.
   */
  async updateTodo(
    todoId: string,
    updateData: Partial<Todo>,
    userId: string,
    env: AppConfig,
  ): Promise<Result<void, ErrorCode>> {
    const supabase = SupabaseClient.getClient(env);

    // Check edit permission
    const canEditResult = await this.checkEditPermission(todoId, userId, env);
    if (canEditResult.isErr()) {
      return errResult(canEditResult.error);
    }
    const canEdit = canEditResult.value;

    if (!canEdit) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    // Update TODO
    const {error} = await (supabase as any)
      .from('todos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todoId);

    if (error) {
      return errResult(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

    return okResult(undefined);
  }

  /**
   * Gets TODO room user list.
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

    // Get all users with access to this TODO
    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .single<{ created_by: string }>();

    if (!todo) {
      return [];
    }

    // Get creator information
    const creatorResponse = await supabase.auth.admin.getUserById(todo.created_by);

    // Get shared users
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

    // Get shared user information
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
   * Checks edit permission.
   */
  private async checkEditPermission(
    todoId: string,
    userId: string,
    env: AppConfig,
  ): Promise<Result<boolean, ErrorCode>> {
    const supabase = SupabaseClient.getClient(env);

    const {data: todo} = await supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single<{created_by: string}>();

    if (!todo) {
      return okResult(false);
    }

    // If creator, allow editing
    if (todo.created_by === userId) {
      return okResult(true);
    }

    // Check if there is edit permission share
    const {data: share} = await supabase
      .from('todo_shares')
      .select('permission')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single<{permission: string}>();

    return okResult(share?.permission === 'edit');
  }
}
