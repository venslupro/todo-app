import {Hono} from 'hono';
import {zValidator} from '@hono/zod-validator';
import {z} from 'zod';
import {HTTPException} from 'hono/http-exception';
import {MediaService} from '../../core/services/media-service';
import {AppConfig} from '../../shared/config/app-config';
import {
  BadRequestException,
  InternalServerException,
  SuccessResponse,
} from '../../shared/errors/http-exception';
import {EnvironmentConfig, UserInfo} from '../../shared/types/hono-types';
import {BusinessLogger} from '../middleware/logger';
import {BearerAuthMiddleware} from '../middleware/bearer-auth';
import {MediaSchemas} from '../../shared/validation/schemas';
import {MediaType} from '../../core/models/media';

const router = new Hono<{
  Bindings: EnvironmentConfig;
  Variables: { user: UserInfo };
}>();

/**
 * Creates a MediaService instance.
 */
function createMediaService(c: {env: EnvironmentConfig}): MediaService {
  const appConfig = new AppConfig(c.env);
  return new MediaService(appConfig);
}

/**
 * Get media file list.
 * GET /api/v1/media
 */
router.get(
  '/',
  BearerAuthMiddleware.create(),
  async (c) => {
    try {
      const user = c.get('user');

      // Extract query parameters manually since zValidator has issues
      const todoId = c.req.query('todo_id');
      const mediaTypeStr = c.req.query('media_type');
      const mediaType = mediaTypeStr === 'image' ? MediaType.IMAGE :
        mediaTypeStr === 'video' ? MediaType.VIDEO : undefined;
      const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50;
      const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0;

      BusinessLogger.debug('Get media list request', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const mediaService = createMediaService(c);
      const result = await mediaService.getMediaList(user.id, {
        todo_id: todoId,
        media_type: mediaType,
        limit: limit,
        offset: offset,
      });

      if (result.isErr()) {
        BusinessLogger.warn('Get media list failed', {
          userId: user.id,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Get media list successful', {
        userId: user.id,
        count: result.value.length,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({media: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting media list', error as Error, {
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
 * Get upload URL.
 * POST /api/v1/media/upload-url
 */
router.post(
  '/upload-url',
  BearerAuthMiddleware.create(),
  zValidator('json', z.object({
    todo_id: z.string().uuid().optional(),
    file_name: z.string().min(1),
    file_size: z.number().int().positive(),
    mime_type: z.string().min(1),
    duration: z.number().int().positive().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    description: z.string().optional(),
  }).strict()),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedData = c.req.valid('json');

      BusinessLogger.debug('Get upload URL request', {
        userId: user.id,
        todoId: validatedData.todo_id,
        file_name: validatedData.file_name,
        file_size: validatedData.file_size,
        environment: c.env.environment || 'unknown',
      });

      const mediaService = createMediaService(c);
      const result = await mediaService.getUploadUrl(
        validatedData.todo_id || '', // Provide default value
        user.id,
        {
          todo_id: validatedData.todo_id || '',
          file_name: validatedData.file_name,
          file_size: validatedData.file_size,
          mime_type: validatedData.mime_type,
          duration: validatedData.duration,
          width: validatedData.width,
          height: validatedData.height,
        },
      );

      if (result.isErr()) {
        BusinessLogger.warn('Get upload URL failed', {
          userId: user.id,
          todoId: validatedData.todo_id,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Get upload URL successful', {
        userId: user.id,
        todoId: validatedData.todo_id,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse(result.value);
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting upload URL', error as Error, {
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
 * Confirm upload.
 * POST /api/v1/media/:id/confirm
 */
router.post(
  '/:id/confirm',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: MediaSchemas.media.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const mediaId = validatedParams.id;

      BusinessLogger.debug('Confirm upload request', {
        userId: user.id,
        mediaId: mediaId,
        environment: c.env.environment || 'unknown',
      });

      const mediaService = createMediaService(c);
      const media = await mediaService.confirmUpload(mediaId, user.id);

      BusinessLogger.debug('Confirm upload successful', {
        userId: user.id,
        mediaId: mediaId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({media});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error confirming upload', error as Error, {
        userId: c.get('user')?.id,
        mediaId: c.req.param('id'),
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
 * Get media file URL.
 * GET /api/v1/media/:id/url
 */
router.get(
  '/:id/url',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: MediaSchemas.media.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const mediaId = validatedParams.id;

      BusinessLogger.debug('Get media URL request', {
        userId: user.id,
        mediaId: mediaId,
        environment: c.env.environment || 'unknown',
      });

      const mediaService = createMediaService(c);
      const url = await mediaService.getMediaUrl(mediaId, user.id);

      BusinessLogger.debug('Get media URL successful', {
        userId: user.id,
        mediaId: mediaId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({url});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting media URL', error as Error, {
        userId: c.get('user')?.id,
        mediaId: c.req.param('id'),
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
 * Delete media file.
 * DELETE /api/v1/media/:id
 */
router.delete(
  '/:id',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: MediaSchemas.media.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const mediaId = validatedParams.id;

      BusinessLogger.debug('Delete media request', {
        userId: user.id,
        mediaId: mediaId,
        environment: c.env.environment || 'unknown',
      });

      const mediaService = createMediaService(c);
      await mediaService.deleteMedia(mediaId, user.id);

      BusinessLogger.debug('Delete media successful', {
        userId: user.id,
        mediaId: mediaId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({message: 'Media deleted successfully'});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error deleting media', error as Error, {
        userId: c.get('user')?.id,
        mediaId: c.req.param('id'),
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
