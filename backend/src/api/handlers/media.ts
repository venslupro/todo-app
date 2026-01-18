// api/handlers/media.ts
import {Hono} from 'hono';
import {HTTPException} from 'hono/http-exception';
import {EnvironmentConfig, HonoAppType} from '../../shared/types/hono-types';
import {MediaService} from '../../core/services/media-service';
import {
  MediaType,
} from '../../core/models/media';
import {
  BadRequestException,
  InternalServerException,
  SuccessResponse,
  ValidationException,
} from '../../shared/errors/http-exception';
import {jwtMiddleware} from '../middleware/auth-middleware';
import {AppConfig} from '../../shared/config/app-config';

// Define JWT variables type for type safety
type JwtVariables = {
  jwtPayload: {
    sub: string;
    email?: string;
  };
};

const router = new Hono<HonoAppType & {
  Variables: JwtVariables;
}>();

/**
 * Creates a MediaService instance.
 */
function createMediaService(c: {env: EnvironmentConfig}) {
  const envConfig = {
    supabase_url: c.env.supabase_url,
    supabase_anon_key: c.env.supabase_anon_key,
    supabase_service_role_key: c.env.supabase_service_role_key,
    environment: c.env.environment,
  };
  const appConfig = new AppConfig(envConfig);
  return new MediaService(appConfig);
}


/**
 * Get media file list.
 * GET /api/v1/media
 */
router.get('/', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const query = c.req.query();

    const params: any = {
      todo_id: query['todo_id'],
      media_type: query['media_type'] as MediaType,
      limit: query['limit'] ? parseInt(query['limit']) : undefined,
      offset: query['offset'] ? parseInt(query['offset']) : undefined,
    };

    const mediaService = createMediaService(c);
    const result = await mediaService.getMediaList(userId, params);

    if (result.isErr()) {
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse({media: result.value});
    return response.getResponse();
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Get upload URL.
 * POST /api/v1/media/upload-url
 */
router.post('/upload-url', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const body = await c.req.json();

    const {todoId, ...uploadData} = body;

    if (!todoId) {
      const exception = new ValidationException('todoId is required');
      return exception.getResponse();
    }

    const mediaService = createMediaService(c);
    const result = await mediaService.getUploadUrl(todoId, userId, uploadData);

    if (result.isErr()) {
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Confirm upload.
 * POST /api/v1/media/:id/confirm
 */
router.post('/:id/confirm', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const mediaId = c.req.param('id');

    const mediaService = createMediaService(c);
    const media = await mediaService.confirmUpload(mediaId, userId);

    const response = new SuccessResponse({media});
    return response.getResponse();
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Get media file URL.
 * GET /api/v1/media/:id/url
 */
router.get('/:id/url', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const mediaId = c.req.param('id');

    const mediaService = createMediaService(c);
    const url = await mediaService.getMediaUrl(mediaId, userId);

    const response = new SuccessResponse({url});
    return response.getResponse();
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Delete media file.
 * DELETE /api/v1/media/:id
 */
router.delete('/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const mediaId = c.req.param('id');

    const mediaService = createMediaService(c);
    await mediaService.deleteMedia(mediaId, userId);

    const response = new SuccessResponse({success: true});
    return response.getResponse();
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

export default router;


