// api/handlers/team.ts
import {Hono} from 'hono';
import {HonoAppType} from '../../shared/types/hono-types';
import {HttpErrors} from '../../shared/errors/http-errors';
import {ShareService} from '../../core/services/share-service';
import {
  SharePermission,
  // ShareQueryParams,
} from '../../core/models/share';

const router = new Hono<HonoAppType>();

// Function to create service instance
function createShareService(c: any) {
  return new ShareService(c.env);
}

/**
 * Share TODO with other users
 * POST /api/v1/team/shares
 */
router.post('/shares', async (c) => {
  const user = c.get('user') as any;
  const body = await c.req.json();

  const shareService = createShareService(c);
  const share = await shareService.createShare(user.id, body);

  return c.json(new HttpErrors.OkResponse(share), 201);
});

/**
 * Get share list
 * GET /api/v1/team/shares
 */
router.get('/shares', async (c) => {
  const user = c.get('user') as any;
  const query = c.req.query();

  const params: any = {
    todo_id: query['todo_id'],
    user_id: query['user_id'],
    permission: query['permission'] as SharePermission,
    limit: query['limit'] ? parseInt(query['limit']) : undefined,
    offset: query['offset'] ? parseInt(query['offset']) : undefined,
  };

  const shareService = createShareService(c);
  const shares = await shareService.getShares(user.id, params);

  return c.json(new HttpErrors.OkResponse({shares}));
});

/**
 * Get single share
 * GET /api/v1/team/shares/:id
 */
router.get('/shares/:id', async (c) => {
  const user = c.get('user') as any;
  const shareId = c.req.param('id');

  const shareService = createShareService(c);
  const share = await shareService.getShare(shareId, user.id);

  return c.json(new HttpErrors.OkResponse(share));
});

/**
 * Update share permission
 * PUT /api/v1/team/shares/:id
 */
router.put('/shares/:id', async (c) => {
  const user = c.get('user') as any;
  const shareId = c.req.param('id');
  const body = await c.req.json();

  const shareService = createShareService(c);
  const share = await shareService.updateShare(shareId, user.id, body);

  return c.json(new HttpErrors.OkResponse(share));
});

/**
 * Delete share
 * DELETE /api/v1/team/shares/:id
 */
router.delete('/shares/:id', async (c) => {
  const user = c.get('user') as any;
  const shareId = c.req.param('id');

  const shareService = createShareService(c);
  await shareService.deleteShare(shareId, user.id);

  return c.json(new HttpErrors.OkResponse({success: true}));
});

export default router;
