// api/handlers/team.ts
import {Hono} from 'hono';
import {jwt} from 'hono/jwt';
import {HTTPException} from 'hono/http-exception';
import {Context, Next} from 'hono';
import {HonoAppType} from '../../shared/types/hono-types';
import {ShareService} from '../../core/services/share-service';
import {
  SharePermission,
} from '../../core/models/share';
import {
  BadRequestException,
  InternalServerException,
  SuccessResponse,
  NotFoundException,
} from '../../shared/errors/http-exception';

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
 * Creates a ShareService instance.
 */
function createShareService(c: any) {
  return new ShareService(c.env);
}

/**
 * JWT middleware for protected routes.
 */
const jwtMiddleware = (c: Context, next: Next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256',
  });
  return jwtMiddleware(c, next);
};

/**
 * Share TODO with other users.
 * POST /api/v1/team/shares
 */
router.post('/shares', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const body = await c.req.json();

    const shareService = createShareService(c);
    const result = await shareService.createShare(userId, body);

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
 * Get share list.
 * GET /api/v1/team/shares
 */
router.get('/shares', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const query = c.req.query();

    const params: any = {
      todo_id: query['todo_id'],
      user_id: query['user_id'],
      permission: query['permission'] as SharePermission,
      limit: query['limit'] ? parseInt(query['limit']) : undefined,
      offset: query['offset'] ? parseInt(query['offset']) : undefined,
    };

    const shareService = createShareService(c);
    const result = await shareService.getShares(userId, params);

    if (result.isErr()) {
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse({shares: result.value});
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
 * Get single share.
 * GET /api/v1/team/shares/:id
 */
router.get('/shares/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const shareId = c.req.param('id');

    const shareService = createShareService(c);
    const result = await shareService.getShare(shareId, userId);

    if (result.isErr()) {
      const exception = new NotFoundException(result.error);
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
 * Update share permission.
 * PUT /api/v1/team/shares/:id
 */
router.put('/shares/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const shareId = c.req.param('id');
    const body = await c.req.json();

    const shareService = createShareService(c);
    const result = await shareService.updateShare(shareId, userId, body);

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
 * Delete share.
 * DELETE /api/v1/team/shares/:id
 */
router.delete('/shares/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const shareId = c.req.param('id');

    const shareService = createShareService(c);
    const result = await shareService.deleteShare(shareId, userId);

    if (result.isErr()) {
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

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

