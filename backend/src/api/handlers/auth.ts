// api/handlers/auth.ts
import {Hono} from 'hono';
import {HttpErrors} from '../../shared/errors/http-errors';
import {AuthService} from '../../core/services/auth-service';
import {AppConfig} from '../../shared/config/config';

const router = new Hono<{
  Bindings: {
    supabase_url: string;
    supabase_service_role_key: string;
    supabase_anon_key: string;
    environment: 'development' | 'production' | 'staging';
  };
  Variables: {};
}>();

// Function to create service instance
function createAuthService(c: { env: { supabase_url: string; supabase_service_role_key: string; supabase_anon_key: string; environment: 'development' | 'production' | 'staging'; } }) {
  const envConfig = {
    supabase_url: c.env.supabase_url,
    supabase_anon_key: c.env.supabase_anon_key,
    supabase_service_role_key: c.env.supabase_service_role_key,
    environment: c.env.environment,
  };
  const appConfig = new AppConfig(envConfig);
  return new AuthService(appConfig);
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
