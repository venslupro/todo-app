// src/middleware/auth.ts
// Authentication middleware for verifying JWT tokens using Supabase SDK

import {Context, Next} from 'hono';
import {UnauthorizedException} from '../../shared/errors/http-exception';
import {SupabaseDriver} from '../../core/drivers/supabase/supabase';

export const createAuthMiddleware = (options: { supabaseDriver: SupabaseDriver }) => {
  return async (c: Context, next: Next) => {
    try {
      // Get the Authorization header
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header is required');
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid authorization header format');
      }

      // Use Supabase SDK to verify token
      const {data, error} = await options.supabaseDriver
        .getAnonClient()
        .auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Add user ID to context
      c.set('userId', data.user.id);

      await next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Token verification failed: ${(error as Error).message}`);
    }
  };
};
