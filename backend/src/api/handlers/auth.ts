// api/handlers/auth.ts
import {Hono} from 'hono';
import {jwt} from 'hono/jwt';
import {HTTPException} from 'hono/http-exception';
import {HttpExceptions} from '../../shared/errors/http-exception';
import {AuthService} from '../../core/services/auth-service';
import {AppConfig} from '../../shared/config/config';

// Define JWT variables type for type safety
type JwtVariables = {
  jwtPayload: {
    sub: string;
    email?: string;
    iat: number;
    exp: number;
  };
};

const router = new Hono<{
  Bindings: {
    supabase_url: string;
    supabase_service_role_key: string;
    supabase_anon_key: string;
    environment: 'development' | 'production' | 'staging';
    JWT_SECRET: string;
  };
  Variables: JwtVariables;
}>();

/**
 * Creates an AuthService instance.
 */
function createAuthService(
  c: {
    env: {
      supabase_url: string;
      supabase_service_role_key: string;
      supabase_anon_key: string;
      environment: 'development' | 'production' | 'staging';
    };
  },
): AuthService {
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
 * User registration.
 * POST /api/v1/auth/register
 */
router.post('/register', async (c) => {
  try {
    const body = await c.req.json();

    const authService = createAuthService(c);
    const result = await authService.register(body);

    if (result.isErr()) {
      throw new HttpExceptions.BadRequestException('Registration failed', result.error);
    }

    return c.json(new HttpExceptions.SuccessResponse(result.value), 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Registration failed', error);
  }
});

/**
 * User login.
 * POST /api/v1/auth/login
 */
router.post('/login', async (c) => {
  try {
    const body = await c.req.json();

    const authService = createAuthService(c);
    const result = await authService.login(body);

    if (result.isErr()) {
      throw new HttpExceptions.UnauthorizedException('Login failed', result.error);
    }

    return c.json(new HttpExceptions.SuccessResponse(result.value));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Login failed', error);
  }
});

/**
 * Refresh token.
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.refresh_token) {
      throw new HttpExceptions.ValidationException('Refresh token is required');
    }

    const authService = createAuthService(c);
    const result = await authService.refreshToken(body.refresh_token);

    if (result.isErr()) {
      throw new HttpExceptions.UnauthorizedException('Token refresh failed', result.error);
    }

    return c.json(new HttpExceptions.SuccessResponse(result.value));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Token refresh failed', error);
  }
});

/**
 * User logout.
 * POST /api/v1/auth/logout
 */
router.post('/logout', jwtMiddleware, async (c) => {
  try {
    const authService = createAuthService(c);
    await authService.logout();

    return c.json(new HttpExceptions.SuccessResponse({success: true}));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Logout failed', error);
  }
});

/**
 * Get current user information.
 * GET /api/v1/auth/me
 */
router.get('/me', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const authService = createAuthService(c);
    const result = await authService.getCurrentUser(userId);

    if (result.isErr()) {
      throw new HttpExceptions.UnauthorizedException('User not found', result.error);
    }

    return c.json(new HttpExceptions.SuccessResponse(result.value));
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HttpExceptions.InternalServerException('Get user failed', error);
  }
});

export default router;