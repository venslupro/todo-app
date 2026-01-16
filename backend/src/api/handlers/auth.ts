// api/handlers/auth.ts
import {Hono} from 'hono';
import {HTTPException} from 'hono/http-exception';
import {AuthService} from '../../core/services/auth-service';
import {AppConfig} from '../../shared/config/app-config';
import {
  BadRequestException,
  ConflictException,
  InternalServerException,
  SuccessResponse,
  UnauthorizedException,
} from '../../shared/errors/http-exception';
import {SupabaseConfig} from '../../shared/types/hono-types';
import {ErrorCode} from '../../shared/errors/error-codes';
import {BusinessLogger} from '../middleware/logger';
import {jwtMiddleware} from '../middleware/auth-middleware';

// Define JWT variables type for type safety
type JwtVariables = {
  jwtPayload: {
    sub: string;
    email?: string;
  };
};

const router = new Hono<{
  Bindings: SupabaseConfig;
  Variables: JwtVariables;
}>();

/**
 * Creates an auth service instance.
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
 * User registration.
 * POST /api/v1/auth/register
 */
router.post('/register', async (c) => {
  try {
    const body = await c.req.json();

    BusinessLogger.debug('User registration attempt', {
      email: body.email,
      environment: c.env.environment || 'unknown',
    });

    const authService = createAuthService(c);
    const result = await authService.register(body);

    if (result.isErr()) {
      BusinessLogger.warn('User registration failed', {
        email: body.email,
        error: result.error,
        errorType: result.error === ErrorCode.AUTH_EMAIL_EXISTS ?
          'EMAIL_EXISTS' : 'VALIDATION_ERROR',
      });

      // Handle email already exists case specifically
      if (result.error === ErrorCode.AUTH_EMAIL_EXISTS) {
        const exception = new ConflictException('Email address is already registered');
        return exception.getResponse();
      }
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('User registration successful', {
      userId: result.value.user.id,
      email: result.value.user.email,
      environment: c.env.environment || 'unknown',
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error during user registration', error as Error, {
      email: (await c.req.json()).email,
    });
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

    BusinessLogger.debug('User login attempt', {
      email: body.email,
      environment: c.env.environment || 'unknown',
    });

    const authService = createAuthService(c);
    const result = await authService.login(body);

    if (result.isErr()) {
      BusinessLogger.warn('User login failed', {
        email: body.email,
        error: result.error,
        environment: c.env.environment || 'unknown',
      });
      const exception = new UnauthorizedException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('User login successful', {
      userId: result.value.user.id,
      email: result.value.user.email,
      environment: c.env.environment || 'unknown',
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error during user login', error as Error, {
      email: (await c.req.json()).email,
    });
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

    BusinessLogger.debug('Token refresh attempt', {
      hasRefreshToken: !!body.refresh_token,
      environment: c.env.environment || 'unknown',
    });

    if (!body.refresh_token) {
      BusinessLogger.warn('Token refresh failed - missing refresh token');
      const exception = new BadRequestException('Refresh token is required');
      return exception.getResponse();
    }

    const authService = createAuthService(c);
    const result = await authService.refreshToken(body.refresh_token);

    if (result.isErr()) {
      BusinessLogger.warn('Token refresh failed', {
        error: result.error,
        environment: c.env.environment || 'unknown',
      });
      const exception = new UnauthorizedException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('Token refresh successful', {
      userId: result.value.user.id,
      environment: c.env.environment || 'unknown',
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error during token refresh', error as Error, {
      hasRefreshToken: !!(await c.req.json()).refresh_token,
    });
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
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    BusinessLogger.debug('User logout attempt', {
      userId: userId,
      environment: c.env.environment || 'unknown',
    });

    const authService = createAuthService(c);
    await authService.logout();

    BusinessLogger.info('User logout successful', {
      userId: userId,
      environment: c.env.environment || 'unknown',
    });

    const response = new SuccessResponse({success: true});
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error during user logout', error as Error, {
      userId: c.get('jwtPayload')?.sub,
    });
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

    BusinessLogger.debug('Fetching current user information', {
      userId: userId,
      environment: c.env.environment || 'unknown',
    });

    const authService = createAuthService(c);
    const result = await authService.getCurrentUser(userId);

    if (result.isErr()) {
      BusinessLogger.warn('Failed to fetch current user information', {
        userId: userId,
        error: result.error,
        environment: c.env.environment || 'unknown',
      });
      const exception = new UnauthorizedException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.debug('Current user information fetched successfully', {
      userId: userId,
      email: result.value.email,
      environment: c.env.environment || 'unknown',
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error fetching current user info', error as Error, {
      userId: c.get('jwtPayload')?.sub,
    });
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

export default router;

