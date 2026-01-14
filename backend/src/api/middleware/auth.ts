import {Context, Next} from 'hono';
import {HttpErrors} from '../../shared/errors/http-errors';
import {AuthService} from '../../core/services/auth-service';
import {AppConfig} from '../../shared/config/config';

/**
 * Authentication middleware.
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpErrors.UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // Use authentication service to verify token
    const config = new AppConfig(c.env as Record<string, unknown>);
    const authService = new AuthService(config);
    const user = await authService.verifyToken(token);

    // Add user information to context
    c.set('user', user);

    await next();
  } catch (error) {
    if (error instanceof HttpErrors.UnauthorizedError) {
      throw error;
    }
    throw new HttpErrors.UnauthorizedError('Authentication failed');
  }
};
