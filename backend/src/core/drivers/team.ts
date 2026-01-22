// src/drivers/team.ts
// Team driver for handling team sharing operations

import {Result, err, ok} from 'neverthrow';
import {SupabaseDriver} from './supabase/supabase';
import {TeamMember, TodoShare} from '../models/types';
import {Logger} from '../../shared/utils/logger';

interface TeamDriverOptions {
  supabase: SupabaseDriver;
  logger: Logger;
}

export class TeamDriver {
  private readonly supabase: SupabaseDriver;
  private readonly logger: Logger;

  constructor(options: TeamDriverOptions) {
    this.supabase = options.supabase;
    this.logger = options.logger;
  }

  /**
   * Get all team members for a user
   */
  async getTeamMembers(
    userId: string,
    todoId?: string,
  ): Promise<Result<TeamMember[], Error>> {
    try {
      this.logger.debug('TeamDriver: Getting team members', {userId, todoId});
      let query = this.supabase
        .getAnonClient()
        .from('todo_shares')
        .select('id, permission, shared_at:created_at, user_id');

      if (todoId) {
        query = query.eq('todo_id', todoId);
      } else {
        // Get all shares where the user is either the sharer or the sharee
        query = query.or(`shared_by.eq.${userId},user_id.eq.${userId}`);
      }

      const {data: shares, error} = await query;

      if (error) {
        this.logger.error('TeamDriver: Get members failed', {userId, error: error.message});
        return err(new Error(`${error.message}`));
      }

      if (!shares || shares.length === 0) {
        this.logger.debug('TeamDriver: No team members found', {userId, todoId});
        return ok([]);
      }

      // Get unique user IDs from shares
      const userIds = [...new Set(shares.map((share) => share.user_id))];

      // Fetch user details from auth.users table using service client
      const {data: users, error: userError} = await this.supabase
        .getServiceClient()
        .from('auth.users')
        .select('id, email, raw_user_meta_data')
        .in('id', userIds);

      if (userError) {
        this.logger.error('TeamDriver: Get users failed', {userId, error: userError.message});
        return err(new Error(`${userError.message}`));
      }

      if (!users) {
        this.logger.debug('TeamDriver: No users found for shares', {userId});
        return ok([]);
      }

      // Map user details to a dictionary for easy lookup
      const userMap = new Map(users.map((user) => [user.id, {
        email: user.email,
        username: user.raw_user_meta_data?.username as string,
        // eslint-disable-next-line camelcase
        full_name: user.raw_user_meta_data?.full_name as string,
        avatar_url: user.raw_user_meta_data?.avatar_url as string | null,
      }]));

      // Combine share information with user details
      this.logger.debug('TeamDriver: Processing shares', {userId, shareCount: shares.length});
      const members: TeamMember[] = shares.map((share) => {
        const userDetails = userMap.get(share.user_id) || {
          email: '',
          username: '',
          // eslint-disable-next-line camelcase
          full_name: '',
          avatar_url: null,
        };

        return {
          id: share.user_id,
          email: userDetails.email,
          username: userDetails.username,
          // eslint-disable-next-line camelcase
          full_name: userDetails.full_name,
          avatar_url: userDetails.avatar_url,
          permission: share.permission,
          shared_at: share.shared_at,
        };
      });

      this.logger.debug('TeamDriver: Got team members', {userId, memberCount: members.length});
      return ok(members);
    } catch (error) {
      this.logger.error('TeamDriver: Get members error', {userId, error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Share a todo with a team member
   */
  async shareTodo(
    todoId: string,
    userId: string,
    sharedBy: string,
    permission: 'view' | 'edit',
  ): Promise<Result<TodoShare, Error>> {
    try {
      this.logger.debug('TeamDriver: Sharing todo', {todoId, userId, sharedBy});
      const {data: share, error} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .insert({
          todo_id: todoId,
          user_id: userId,
          shared_by: sharedBy,
          permission,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('TeamDriver: Share failed', {todoId, userId, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TeamDriver: Todo shared', {todoId, userId, shareId: share.id});
      return ok(share as TodoShare);
    } catch (error) {
      this.logger.error('TeamDriver: Share error', {error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Update share permission
   */
  async updateSharePermission(
    shareId: string,
    permission: 'view' | 'edit',
  ): Promise<Result<TodoShare, Error>> {
    try {
      this.logger.debug('TeamDriver: Updating share permission', {shareId, permission});
      const {data: share, error} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .update({permission})
        .eq('id', shareId)
        .select()
        .single();

      if (error) {
        this.logger.error('TeamDriver: Update permission failed', {shareId, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TeamDriver: Permission updated', {shareId, permission});
      return ok(share as TodoShare);
    } catch (error) {
      this.logger.error('TeamDriver: Update error', {error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Remove a share
   */
  async removeShare(
    shareId: string,
  ): Promise<Result<boolean, Error>> {
    try {
      this.logger.debug('TeamDriver: Removing share', {shareId});
      const {error} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .delete()
        .eq('id', shareId);

      if (error) {
        this.logger.error('TeamDriver: Remove failed', {shareId, error: error.message});
        return err(new Error(`${error.message}`));
      }

      this.logger.debug('TeamDriver: Share removed successfully', {shareId});
      return ok(true);
    } catch (error) {
      this.logger.error('TeamDriver: Remove error', {error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }

  /**
   * Check if a user has permission to access a todo
   */
  async checkTodoPermission(
    todoId: string,
    userId: string,
    requiredPermission?: 'view' | 'edit',
  ): Promise<Result<boolean, Error>> {
    try {
      this.logger.debug('TeamDriver: Checking permission', {todoId, userId, requiredPermission});
      // First check if the user is the owner
      const {data: todo, error: todoError} = await this.supabase
        .getAnonClient()
        .from('todos')
        .select('created_by')
        .eq('id', todoId)
        .single();

      if (todoError) {
        this.logger.error('TeamDriver: Check failed', {error: todoError.message});
        return err(new Error(`${todoError.message}`));
      }

      if (todo.created_by === userId) {
        this.logger.debug('TeamDriver: User is owner, permission granted', {todoId, userId});
        return ok(true);
      }

      // If not owner, check if they have a share with appropriate permission
      this.logger.debug('TeamDriver: Checking share permissions', {todoId, userId});
      const {data: share, error: shareError} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .select('permission')
        .eq('todo_id', todoId)
        .eq('user_id', userId)
        .single();

      if (shareError) {
        this.logger.debug('TeamDriver: No share found', {todoId, userId});
        return ok(false);
      }

      if (requiredPermission === 'edit') {
        const hasPermission = share.permission === 'edit';
        this.logger.debug('TeamDriver: Edit permission check', {todoId, userId, hasPermission});
        return ok(hasPermission);
      }

      this.logger.debug('TeamDriver: View permission granted', {todoId, userId});
      return ok(true);
    } catch (error) {
      this.logger.error('TeamDriver: Check error', {error: (error as Error).message});
      return err(new Error(`${(error as Error).message}`));
    }
  }
}

export const createTeamDriver = (options: TeamDriverOptions): TeamDriver => {
  return new TeamDriver(options);
};
