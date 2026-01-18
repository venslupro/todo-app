import {Hono} from 'hono';
import {zValidator} from '@hono/zod-validator';
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
import {EnvironmentConfig, UserInfo} from '../../shared/types/hono-types';
import {ErrorCode} from '../../shared/errors/error-codes';
import {BusinessLogger} from '../middleware/logger';
import {BearerAuthMiddleware} from '../middleware/bearer-auth';
import {UserSchemas} from '../../shared/validation/schemas';

const router = new Hono<{
  Bindings: EnvironmentConfig;
  Variables: { user: UserInfo };
}>();

/**
 * Creates an auth service instance.
 */
function createAuthService(c: { env: EnvironmentConfig }): AuthService {
  const appConfig = new AppConfig(c.env);
  return new AuthService(appConfig);
}

/**
 * User registration.
 * POST /api/v1/auth/register
 */
router.post(
  '/register',
  zValidator('json', UserSchemas.register),
  async (c) => {
    try {
      const validatedData = c.req.valid('json');

      BusinessLogger.debug('User registration attempt', {
        email: validatedData.email,
        environment: c.env.environment || 'unknown',
      });

      const authService = createAuthService(c);
      const result = await authService.register(validatedData);

      if (result.isErr()) {
        const errorMessage = mapErrorCodeToMessage(result.error);

        BusinessLogger.warn('User registration failed', {
          email: validatedData.email,
          error: result.error,
          errorMessage: errorMessage,
          errorType: result.error === ErrorCode.AUTH_EMAIL_EXISTS ?
            'EMAIL_EXISTS' : 'VALIDATION_ERROR',
        });

        if (result.error === ErrorCode.AUTH_EMAIL_EXISTS) {
          const exception = new ConflictException(errorMessage);
          return exception.getResponse();
        }

        const exception = new BadRequestException(errorMessage);
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
  },
);

/**
 * User login.
 * POST /api/v1/auth/login
 */
router.post(
  '/login',
  zValidator('json', UserSchemas.login),
  async (c) => {
    try {
      const validatedData = c.req.valid('json');

      BusinessLogger.debug('User login attempt', {
        email: validatedData.email,
        environment: c.env.environment || 'unknown',
      });

      const authService = createAuthService(c);
      const result = await authService.login(validatedData);

      if (result.isErr()) {
        BusinessLogger.warn('User login failed', {
          email: validatedData.email,
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
  },
);

/**
 * Refresh token.
 * POST /api/v1/auth/refresh
 */
router.post(
  '/refresh',
  zValidator('json', UserSchemas.refreshToken),
  async (c) => {
    try {
      const validatedData = c.req.valid('json');

      BusinessLogger.debug('Token refresh attempt');

      const authService = createAuthService(c);
      const result = await authService.refreshToken(validatedData.refresh_token);

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
      BusinessLogger.error('Unexpected error during token refresh', error as Error);

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * User logout.
 * POST /api/v1/auth/logout
 */
router.post(
  '/logout',
  BearerAuthMiddleware.create(),
  async (c) => {
    try {
      const user = c.get('user');

      BusinessLogger.debug('User logout attempt', {
        userId: user.id,
        environment: c.env.environment || 'unknown',
      });

      const authService = createAuthService(c);
      await authService.logout();

      BusinessLogger.info('User logout successful', {
        userId: user.id,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({message: 'Logged out successfully'});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error during user logout', error as Error, {
        userId: c.get('user')?.id,
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Get current user profile.
 * GET /api/v1/auth/profile
 */
router.get(
  '/profile',
  BearerAuthMiddleware.create(),
  async (c) => {
    try {
      const user = c.get('user');

      BusinessLogger.debug('Get user profile', {
        userId: user.id,
        environment: c.env.environment || 'unknown',
      });

      // Get full user information from Supabase
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        const exception = new UnauthorizedException('Missing token');
        return exception.getResponse();
      }

      const authService = createAuthService(c);
      const result = await authService.getCurrentUser(token);

      if (result.isErr()) {
        BusinessLogger.warn('Get user profile failed', {
          userId: user.id,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new InternalServerException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Get user profile successful', {
        userId: user.id,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse(result.value);
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting user profile', error as Error, {
        userId: c.get('user')?.id,
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Maps error codes to user-friendly messages.
 */
function mapErrorCodeToMessage(errorCode: string): string {
  switch (errorCode) {
  case ErrorCode.AUTH_EMAIL_EXISTS:
    return 'Email address is already registered';
  case ErrorCode.VALIDATION_INVALID_EMAIL:
    return 'Invalid email format. Please provide a valid email address';
  case ErrorCode.VALIDATION_INVALID_PASSWORD:
    return 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
  case ErrorCode.VALIDATION_REQUIRED_FIELD:
    return 'Required field is missing or invalid';
  default:
    return 'Registration failed. Please try again';
  }
}

export default router;
