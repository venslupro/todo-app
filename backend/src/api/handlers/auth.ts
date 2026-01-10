// api/handlers/auth.ts
import {Hono} from 'hono';
import {HttpErrors} from '../../shared/errors/http-errors';
import {AuthService} from '../../core/services/auth-service';

const router = new Hono();

// 创建服务实例的函数
function createAuthService(c: any) {
  return new AuthService(c.env);
}

/**
 * 用户注册
 * POST /api/v1/auth/register
 */
router.post('/register', async (c) => {
  const body = await c.req.json();

  const authService = createAuthService(c);
  const result = await authService.register(body);

  return c.json(new HttpErrors.OkResponse(result), 201);
});

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
router.post('/login', async (c) => {
  const body = await c.req.json();

  const authService = createAuthService(c);
  const result = await authService.login(body);

  return c.json(new HttpErrors.OkResponse(result));
});

/**
 * 刷新令牌
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
 * 用户登出
 * POST /api/v1/auth/logout
 */
router.post('/logout', async (c) => {
  const body = await c.req.json();

  if (!body.access_token) {
    throw new HttpErrors.ValidationError('Access token is required');
  }

  const authService = createAuthService(c);
  await authService.logout(body.access_token);

  return c.json(new HttpErrors.OkResponse({success: true}));
});

/**
 * 获取当前用户信息
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
