// api/handlers/auth.ts
import {Hono} from 'hono';
import {HttpErrors} from '../../shared/errors/http-errors';
import {AuthService} from '../../core/services/auth-service';

const router = new Hono();

// Function to create service instance
function createAuthService(c: any) {
  return new AuthService(c.env);
}

/**
 * User registration
 * POST /api/v1/auth/register
 */
router.post('/register', async (c) => {
  const body = await c.req.json();

  const authService = createAuthService(c);
  const result = await authService.register(body);

  return c.json(new HttpErrors.OkResponse(result), 201);
});

/**
 * User login
 * POST /api/v1/auth/login
 */
router.post('/login', async (c) => {
  const body = await c.req.json();

  const authService = createAuthService(c);
  const result = await authService.login(body);

  return c.json(new HttpErrors.OkResponse(result));
});

/**
 * Refresh token
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (c) => {
  const body = await c.req.json();

  if (!body.refresh_token) {
    throw new HttpErrors.ValidationError('Refresh token is required');
  }

  const authService = createAuthService(c);
  const result = await authService.refreshToken(body.refresh_token);

  return c.json(new HttpErrors.OkResponse(result));
});

/**
 * User logout
 * POST /api/v1/auth/logout
 */
router.post('/logout', async (c) => {
  const authService = createAuthService(c);
  await authService.logout();

  return c.json(new HttpErrors.OkResponse({success: true}));
});

/**
 * Get current user information
 * GET /api/v1/auth/me
 */
router.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpErrors.UnauthorizedError('Missing authorization header');
  }

  const token = authHeader.substring(7);

  const authService = createAuthService(c);
  const user = await authService.getCurrentUser(token);

  return c.json(new HttpErrors.OkResponse({user}));
});

export default router;
