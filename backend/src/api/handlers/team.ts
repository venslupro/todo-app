import {Hono} from 'hono';
import {zValidator} from '@hono/zod-validator';
import {z} from 'zod';
import {HTTPException} from 'hono/http-exception';
import {ShareService} from '../../core/services/share-service';
import {AppConfig} from '../../shared/config/app-config';
import {
  BadRequestException,
  InternalServerException,
  SuccessResponse,
  NotFoundException,
} from '../../shared/errors/http-exception';
import {EnvironmentConfig, UserInfo} from '../../shared/types/hono-types';
import {BusinessLogger} from '../middleware/logger';
import {BearerAuthMiddleware} from '../middleware/bearer-auth';
import {TeamSchemas} from '../../shared/validation/schemas';
import {SharePermission} from '../../core/models/share';

const router = new Hono<{
  Bindings: EnvironmentConfig;
  Variables: { user: UserInfo };
}>();

/**
 * Creates a ShareService instance.
 */
function createShareService(c: {env: EnvironmentConfig}): ShareService {
  const appConfig = new AppConfig(c.env);
  return new ShareService(appConfig);
}

/**
 * Share TODO with other users.
 * POST /api/v1/team/shares
 */
router.post(
  '/shares',
  BearerAuthMiddleware.create(),
  zValidator('json', TeamSchemas.createShare),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedData = c.req.valid('json');

      BusinessLogger.debug('Share TODO request', {
        userId: user.id,
        todoId: validatedData.todo_id,
        targetUserId: validatedData.user_id,
        environment: c.env.environment || 'unknown',
      });

      const shareService = createShareService(c);
      const result = await shareService.createShare(
        user.id,
        {
          todo_id: validatedData.todo_id,
          user_id: validatedData.user_id,
          permission: validatedData.permission as SharePermission,
        },
      );

      if (result.isErr()) {
        BusinessLogger.warn('Share TODO failed', {
          userId: user.id,
          todoId: validatedData.todo_id,
          targetUserId: validatedData.user_id,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Share TODO successful', {
        userId: user.id,
        todoId: validatedData.todo_id,
        targetUserId: validatedData.user_id,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({share: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error sharing TODO', error as Error, {
        userId: c.get('user')?.id,
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Get shared TODOs.
 * GET /api/v1/team/shares
 */
router.get(
  '/shares',
  BearerAuthMiddleware.create(),
  async (c) => {
    try {
      const user = c.get('user');

      // Extract query parameters manually since zValidator has issues
      const todoId = c.req.query('todo_id');
      const userId = c.req.query('user_id');
      const permissionStr = c.req.query('permission');
      const permission = permissionStr === 'view' ? SharePermission.VIEW :
        permissionStr === 'edit' ? SharePermission.EDIT : undefined;
      const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50;
      const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0;

      BusinessLogger.debug('Get shared TODOs request', {
        userId: user.id,
        queryParams: {todo_id: todoId, user_id: userId, permission, limit, offset},
        environment: c.env.environment || 'unknown',
      });

      const shareService = createShareService(c);
      const result = await shareService.getShares(user.id, {
        todo_id: todoId,
        user_id: userId,
        permission: permission,
        limit: limit,
        offset: offset,
      });

      if (result.isErr()) {
        BusinessLogger.warn('Get shared TODOs failed', {
          userId: user.id,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Get shared TODOs successful', {
        userId: user.id,
        count: result.value.length,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({todos: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting shared TODOs', error as Error, {
        userId: c.get('user')?.id,
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Update share permissions.
 * PUT /api/v1/team/shares/:id
 */
router.put(
  '/shares/:id',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: TeamSchemas.share.shape.id})),
  zValidator('json', TeamSchemas.updateShare),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const validatedData = c.req.valid('json');
      const shareId = validatedParams.id;

      BusinessLogger.debug('Update share permissions request', {
        userId: user.id,
        shareId: shareId,
        newPermission: validatedData.permission,
        environment: c.env.environment || 'unknown',
      });

      const shareService = createShareService(c);
      const result = await shareService.updateShare(
        shareId,
        user.id,
        {
          permission: validatedData.permission as SharePermission,
        },
      );

      if (result.isErr()) {
        BusinessLogger.warn('Update share permissions failed', {
          userId: user.id,
          shareId: shareId,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Update share permissions successful', {
        userId: user.id,
        shareId: shareId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({message: 'Share permissions updated successfully'});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error updating share permissions', error as Error, {
        userId: c.get('user')?.id,
        shareId: c.req.param('id'),
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Remove share.
 * DELETE /api/v1/team/shares/:id
 */
router.delete(
  '/shares/:id',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: TeamSchemas.share.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const shareId = validatedParams.id;

      BusinessLogger.debug('Remove share request', {
        userId: user.id,
        shareId: shareId,
        environment: c.env.environment || 'unknown',
      });

      const shareService = createShareService(c);
      const result = await shareService.deleteShare(shareId, user.id);

      if (result.isErr()) {
        BusinessLogger.warn('Remove share failed', {
          userId: user.id,
          shareId: shareId,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Remove share successful', {
        userId: user.id,
        shareId: shareId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({message: 'Share removed successfully'});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error removing share', error as Error, {
        userId: c.get('user')?.id,
        shareId: c.req.param('id'),
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Get team members.
 * GET /api/v1/team/members
 */
router.get(
  '/members',
  BearerAuthMiddleware.create(),
  async (c) => {
    try {
      const user = c.get('user');

      BusinessLogger.debug('Get team members request', {
        userId: user.id,
        environment: c.env.environment || 'unknown',
      });

      // Since ShareService doesn't have getTeamMembers, we'll use getShares with empty params
      const shareService = createShareService(c);
      const result = await shareService.getShares(user.id, {});

      if (result.isErr()) {
        BusinessLogger.warn('Get team members failed', {
          userId: user.id,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Get team members successful', {
        userId: user.id,
        count: result.value.length,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({members: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting team members', error as Error, {
        userId: c.get('user')?.id,
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

export default router;
