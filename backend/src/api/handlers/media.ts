// api/handlers/media.ts
import {Hono} from 'hono';
import {jwt} from 'hono/jwt';
import {HTTPException} from 'hono/http-exception';
import {HonoAppType} from '../../shared/types/hono-types';
import {HttpExceptions} from '../../shared/errors/http-exception';
import {MediaService} from '../../core/services/media-service';
import {
  MediaType,
} from '../../core/models/media';

// Define JWT variables type for type safety
type JwtVariables = {
  jwtPayload: {
    sub: string;
    email?: string;
    iat: number;
    exp: number;
  };
};

const router = new Hono<HonoAppType & {
  Variables: JwtVariables;
}>();

/**
 * Creates a MediaService instance.
 */
function createMediaService(c: any) {
  return new MediaService(c.env);
}

/**
 * JWT middleware for protected routes.
 */
const jwtMiddleware = (c: any, next: any) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256',
  });
  return jwtMiddleware(c, next);
};

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
      throw new HttpExceptions.BadRequestException('Get media list failed', result.error);
    }

    return c.json(new HttpExceptions.SuccessResponse({media: result.value}));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Get media list failed', error);
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
      throw new HttpExceptions.ValidationException('todoId is required');
    }

    const mediaService = createMediaService(c);
    const result = await mediaService.getUploadUrl(todoId, userId, uploadData);

    if (result.isErr()) {
      throw new HttpExceptions.BadRequestException('Get upload URL failed', result.error);
    }

    return c.json(new HttpExceptions.SuccessResponse(result.value));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Get upload URL failed', error);
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

    return c.json(new HttpExceptions.SuccessResponse({media}));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Confirm upload failed', error);
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

    return c.json(new HttpExceptions.SuccessResponse({url}));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Get media URL failed', error);
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

    return c.json(new HttpExceptions.SuccessResponse({success: true}));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Delete media failed', error);
  }
});

export default router;