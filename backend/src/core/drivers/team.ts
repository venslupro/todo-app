// src/drivers/team.ts
// Team driver for handling team sharing operations

import {Result, err, ok} from 'neverthrow';
import {SupabaseDriver} from './supabase/supabase';
import {TeamMember, TodoShare} from '../models/types';

interface TeamDriverOptions {
  supabase: SupabaseDriver;
}

export class TeamDriver {
  private readonly supabase: SupabaseDriver;

  constructor(options: TeamDriverOptions) {
    this.supabase = options.supabase;
  }

  /**
   * Get all team members for a user
   */
  async getTeamMembers(
    userId: string,
    todoId?: string,
  ): Promise<Result<TeamMember[], Error>> {
    try {
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
        return err(new Error(`Get team members failed: ${error.message}`));
      }

      if (!shares || shares.length === 0) {
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
        return err(new Error(`Get user details failed: ${userError.message}`));
      }

      if (!users) {
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

      return ok(members);
    } catch (error) {
      return err(new Error(`Get team members error: ${(error as Error).message}`));
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
        return err(new Error(`Share todo failed: ${error.message}`));
      }

      return ok(share as TodoShare);
    } catch (error) {
      return err(new Error(`Share todo error: ${(error as Error).message}`));
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
      const {data: share, error} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .update({permission})
        .eq('id', shareId)
        .select()
        .single();

      if (error) {
        return err(new Error(`Update share permission failed: ${error.message}`));
      }

      return ok(share as TodoShare);
    } catch (error) {
      return err(new Error(`Update share permission error: ${(error as Error).message}`));
    }
  }

  /**
   * Remove a share
   */
  async removeShare(
    shareId: string,
  ): Promise<Result<boolean, Error>> {
    try {
      const {error} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .delete()
        .eq('id', shareId);

      if (error) {
        return err(new Error(`Remove share failed: ${error.message}`));
      }

      return ok(true);
    } catch (error) {
      return err(new Error(`Remove share error: ${(error as Error).message}`));
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
      // First check if the user is the owner
      const {data: todo, error: todoError} = await this.supabase
        .getAnonClient()
        .from('todos')
        .select('created_by')
        .eq('id', todoId)
        .single();

      if (todoError) {
        return err(new Error(`Check todo permission failed: ${todoError.message}`));
      }

      if (todo.created_by === userId) {
        return ok(true);
      }

      // If not owner, check if they have a share with appropriate permission
      const {data: share, error: shareError} = await this.supabase
        .getAnonClient()
        .from('todo_shares')
        .select('permission')
        .eq('todo_id', todoId)
        .eq('user_id', userId)
        .single();

      if (shareError) {
        return ok(false);
      }

      if (requiredPermission === 'edit') {
        return ok(share.permission === 'edit');
      }

      return ok(true);
    } catch (error) {
      return err(new Error(`Check todo permission error: ${(error as Error).message}`));
    }
  }
}

export const createTeamDriver = (options: TeamDriverOptions): TeamDriver => {
  return new TeamDriver(options);
};
