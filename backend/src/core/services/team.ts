// src/services/team.ts
// Team service for handling team sharing business logic

import {Result, err, ok} from 'neverthrow';
import {TeamDriver} from '../drivers/team';
import {TeamMember, TodoShare} from '../models/types';
import {Logger} from '../../shared/utils/logger';

interface TeamServiceOptions {
  teamDriver: TeamDriver;
  logger: Logger;
}

export class TeamService {
  private readonly teamDriver: TeamDriver;

  constructor(options: TeamServiceOptions) {
    this.teamDriver = options.teamDriver;
  }

  /**
   * Get all team members for a user
   */
  async getTeamMembers(
    userId: string,
    todoId?: string,
  ): Promise<Result<TeamMember[], Error>> {
    try {
      // Call driver to get team members
      const result = await this.teamDriver.getTeamMembers(userId, todoId);

      if (result.isErr()) {
        return err(new Error(`Get team members failed: ${result.error.message}`));
      }

      return ok(result.value);
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
      // Call driver to share todo
      const result = await this.teamDriver.shareTodo(todoId, userId, sharedBy, permission);

      if (result.isErr()) {
        return err(new Error(`Share todo failed: ${result.error.message}`));
      }

      return ok(result.value);
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
      // Call driver to update share permission
      const result = await this.teamDriver.updateSharePermission(shareId, permission);

      if (result.isErr()) {
        return err(new Error(`Update share permission failed: ${result.error.message}`));
      }

      return ok(result.value);
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
      // Call driver to remove share
      const result = await this.teamDriver.removeShare(shareId);

      if (result.isErr()) {
        return err(new Error(`Remove share failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Remove share error: ${(error as Error).message}`));
    }
  }
}

export const createTeamService = (options: TeamServiceOptions): TeamService => {
  return new TeamService(options);
};
