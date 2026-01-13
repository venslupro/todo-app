// api/handlers/media.ts
import {Hono} from 'hono';
import {HonoAppType} from '../../shared/types/hono-types';
import {HttpErrors} from '../../shared/errors/http-errors';
import {MediaService} from '../../core/services/media-service';
import {
  MediaType,
  // MediaQueryParams,
} from '../../core/models/media';

const router = new Hono<HonoAppType>();

// Function to create service instance
function createMediaService(c: any) {
  return new MediaService(c.env);
}

/**
 * Get media file list
 * GET /api/v1/media
 */
router.get('/', async (c) => {
  const user = c.get('user') as any;
  const query = c.req.query();

  const params: any = {
    todo_id: query['todo_id'],
    media_type: query['media_type'] as MediaType,
    limit: query['limit'] ? parseInt(query['limit']) : undefined,
    offset: query['offset'] ? parseInt(query['offset']) : undefined,
  };

  const mediaService = createMediaService(c);
  const media = await mediaService.getMediaList(user.id, params);

  return c.json(new HttpErrors.OkResponse({media}));
});

/**
 * Get upload URL
 * POST /api/v1/media/upload-url
 */
router.post('/upload-url', async (c) => {
  const user = c.get('user') as any;
  const body = await c.req.json();

  const {todoId, ...uploadData} = body;

  if (!todoId) {
    throw new HttpErrors.ValidationError('todoId is required');
  }

  const mediaService = createMediaService(c);
  const result = await mediaService.getUploadUrl(todoId, user.id, uploadData);

  return c.json(new HttpErrors.OkResponse(result));
});

/**
 * Confirm upload
 * POST /api/v1/media/:id/confirm
 */
router.post('/:id/confirm', async (c) => {
  const user = c.get('user') as any;
  const mediaId = c.req.param('id');

  const mediaService = createMediaService(c);
  const media = await mediaService.confirmUpload(mediaId, user.id);

  return c.json(new HttpErrors.OkResponse({media}));
});

/**
 * Get media file URL
 * GET /api/v1/media/:id/url
 */
router.get('/:id/url', async (c) => {
  const user = c.get('user') as any;
  const mediaId = c.req.param('id');

  const mediaService = createMediaService(c);
  const url = await mediaService.getMediaUrl(mediaId, user.id);

  return c.json(new HttpErrors.OkResponse({url}));
});

/**
 * Delete media file
 * DELETE /api/v1/media/:id
 */
router.delete('/:id', async (c) => {
  const user = c.get('user') as any;
  const mediaId = c.req.param('id');

  const mediaService = createMediaService(c);
  await mediaService.deleteMedia(mediaId, user.id);

  return c.json(new HttpErrors.OkResponse({success: true}));
});

export default router;
