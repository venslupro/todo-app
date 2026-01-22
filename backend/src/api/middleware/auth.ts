// src/middleware/auth.ts
// Authentication middleware for verifying JWT tokens using Supabase SDK

import {Context, Next} from 'hono';
import {UnauthorizedException} from '../../shared/errors/http-exception';
import {SupabaseDriver} from '../../core/drivers/supabase/supabase';
import {Logger} from '../../shared/utils/logger';

export const createAuthMiddleware = (
  options: { supabaseDriver: SupabaseDriver; logger: Logger },
) => {
  return async (c: Context, next: Next) => {
    try {
      options.logger.debug('AuthMiddleware: Verifying authorization');
      // Get the Authorization header
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        options.logger.warn('AuthMiddleware: Authorization header is required');
        throw new UnauthorizedException('Authorization header is required');
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        options.logger.warn('AuthMiddleware: Invalid authorization header format');
        throw new UnauthorizedException('Invalid authorization header format');
      }

      // Use Supabase SDK to verify token
      options.logger.debug('AuthMiddleware: Verifying token');
      const {data, error} = await options.supabaseDriver
        .getAnonClient()
        .auth.getUser(token);

      if (error || !data.user) {
        options.logger.warn('AuthMiddleware: Invalid or expired token');
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Add user ID to context
      options.logger.debug('AuthMiddleware: Token verified successfully', {userId: data.user.id});
      c.set('userId', data.user.id);

      await next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      options.logger.error('AuthMiddleware: Token verification failed', {
        error: (error as Error).message,
      });
      throw new UnauthorizedException(
        `Token verification failed: ${(error as Error).message}`,
      );
    }
  };
};
