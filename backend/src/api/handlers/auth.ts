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
import {EnvironmentConfig} from '../../shared/types/hono-types';
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
  Bindings: EnvironmentConfig;
  Variables: JwtVariables;
}>();

/**
 * Creates an auth service instance.
 */
function createAuthService(
  c: {
    env: EnvironmentConfig;
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

    // Validate request body fields
    const allowedFields = ['email', 'password', 'username', 'full_name'];
    const receivedFields = Object.keys(body);
    const invalidFields = receivedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      BusinessLogger.warn('Invalid fields in registration request', {
        invalidFields: invalidFields,
        allowedFields: allowedFields,
        environment: c.env.environment || 'unknown',
      });

      const exception = new BadRequestException(
        `Invalid field(s): ${invalidFields.join(', ')}. ` +
        `Supported fields: ${allowedFields.join(', ')}`,
      );
      return exception.getResponse();
    }

    // Check for required fields
    if (!body.email) {
      BusinessLogger.warn('Missing required field in registration request', {
        missingField: 'email',
        environment: c.env.environment || 'unknown',
      });

      const exception = new BadRequestException('Email is required for registration');
      return exception.getResponse();
    }

    if (!body.password) {
      BusinessLogger.warn('Missing required field in registration request', {
        missingField: 'password',
        environment: c.env.environment || 'unknown',
      });

      const exception = new BadRequestException('Password is required for registration');
      return exception.getResponse();
    }

    BusinessLogger.debug('User registration attempt', {
      email: body.email,
      environment: c.env.environment || 'unknown',
    });

    const authService = createAuthService(c);
    const result = await authService.register(body);

    if (result.isErr()) {
      // Map error codes to user-friendly messages
      let errorMessage: string;
      switch (result.error) {
      case ErrorCode.AUTH_EMAIL_EXISTS:
        errorMessage = 'Email address is already registered';
        break;
      case ErrorCode.VALIDATION_INVALID_EMAIL:
        errorMessage = 'Invalid email format. Please provide a valid email address';
        break;
      case ErrorCode.VALIDATION_INVALID_PASSWORD:
        errorMessage = 'Password must be at least 8 characters long and contain ' +
          'uppercase, lowercase letters and numbers';
        break;
      case ErrorCode.VALIDATION_REQUIRED_FIELD:
        errorMessage = 'Required field is missing or invalid';
        break;
      default:
        errorMessage = 'Registration failed. Please try again';
      }

      BusinessLogger.warn('User registration failed', {
        email: body.email,
        error: result.error,
        errorMessage: errorMessage,
        errorType: result.error === ErrorCode.AUTH_EMAIL_EXISTS ?
          'EMAIL_EXISTS' : 'VALIDATION_ERROR',
      });

      // Handle email already exists case specifically
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
 * GET /api/v1/auth/profile
 */
router.get('/profile', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    // Extract access token from Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    BusinessLogger.debug('Fetching current user information', {
      userId: userId,
      environment: c.env.environment || 'unknown',
    });

    const authService = createAuthService(c);
    const result = await authService.getCurrentUser(accessToken);

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

