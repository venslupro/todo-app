// src/api/handlers/team.ts
// Team API handlers for team sharing management

import {Context} from 'hono';
import {TeamService} from '../../core/services/team';
import {
  ValidationException,
  NotFoundException,
  InternalServerException,
} from '../../shared/errors/http-exception';
import {
  shareTodoSchema,
  updateShareSchema,
  teamMemberFilterSchema,
} from '../../shared/schemas';
import {getUserIdFromContext} from '../../shared/utils';

interface TeamHandlerOptions {
  teamService: TeamService;
}

export class TeamHandler {
  private readonly teamService: TeamService;

  constructor(options: TeamHandlerOptions) {
    this.teamService = options.teamService;
  }

  /**
   * Get all team members for a user
   */
  async getTeamMembers(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Extract and validate query parameters
      const validated = teamMemberFilterSchema.safeParse(c.req.query());
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to get team members
      const result = await this.teamService.getTeamMembers(userId, validated.data.todo_id);

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      return c.json({
        code: 200,
        message: 'Success',
        data: {members: result.value},
      });
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }

  /**
   * Share a todo with a team member
   */
  async shareTodo(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Validate request body
      const body = await c.req.json();
      const validated = shareTodoSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to share todo
      const result = await this.teamService.shareTodo(
        validated.data.todo_id,
        validated.data.user_id,
        userId,
        validated.data.permission,
      );

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      return c.json({
        code: 200,
        message: 'Success',
        data: {share: result.value},
      });
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }

  /**
   * Update share permission
   */
  async updateSharePermission(c: Context) {
    try {
      // Get share ID from path parameters
      const shareId = c.req.param('id');
      if (!shareId) {
        throw new ValidationException('Share ID is required');
      }

      // Validate request body
      const body = await c.req.json();
      const validated = updateShareSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to update share permission
      const result = await this.teamService.updateSharePermission(
        shareId,
        validated.data.permission,
      );

      if (result.isErr()) {
        throw new NotFoundException(result.error.message);
      }

      return c.json({
        code: 200,
        message: 'Success',
        data: {share: result.value},
      });
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }

  /**
   * Remove a share
   */
  async removeShare(c: Context) {
    try {
      // Get share ID from path parameters
      const shareId = c.req.param('id');
      if (!shareId) {
        throw new ValidationException('Share ID is required');
      }

      // Call service to remove share
      const result = await this.teamService.removeShare(shareId);

      if (result.isErr()) {
        throw new NotFoundException(result.error.message);
      }

      return c.json({
        code: 200,
        message: 'Success',
        data: {message: 'Share removed successfully'},
      });
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }
}

export const createTeamHandler = (options: TeamHandlerOptions): TeamHandler => {
  return new TeamHandler(options);
};
