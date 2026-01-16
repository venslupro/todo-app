// api/handlers/auth.ts
import {Hono} from 'hono';
import {jwt} from 'hono/jwt';
import {HTTPException} from 'hono/http-exception';
import {Context, Next} from 'hono';
import {AuthService} from '../../core/services/auth-service';
import {AppConfig} from '../../shared/config/app-config';
import {BadRequestException, InternalServerException, SuccessResponse, UnauthorizedException} from '../../shared/errors/http-exception';
import {SupabaseConfig} from '../../shared/types/hono-types';

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
  Bindings: SupabaseConfig & {
    JWT_SECRET: string;
  };
  Variables: JwtVariables;
}>();

/**
 * Creates an AuthService instance.
 */
function createAuthService(
  c: {
    env: SupabaseConfig;
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
const jwtMiddleware = (c: Context, next: Next) => {
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
 * User login.
 * POST /api/v1/auth/login
 */
router.post('/login', async (c) => {
  try {
    const body = await c.req.json();

    const authService = createAuthService(c);
    const result = await authService.login(body);

    if (result.isErr()) {
      const exception = new UnauthorizedException(result.error);
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
 * Refresh token.
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.refresh_token) {
      const exception = new BadRequestException('Refresh token is required');
      return exception.getResponse();
    }

    const authService = createAuthService(c);
    const result = await authService.refreshToken(body.refresh_token);

    if (result.isErr()) {
      const exception = new UnauthorizedException(result.error);
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
 * User logout.
 * POST /api/v1/auth/logout
 */
router.post('/logout', jwtMiddleware, async (c) => {
  try {
    const authService = createAuthService(c);
    await authService.logout();

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
      const exception = new UnauthorizedException(result.error);
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

export default router;

