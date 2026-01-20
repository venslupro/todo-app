// src/middleware/auth.ts
// Authentication middleware for verifying JWT tokens

import {Context, Next} from 'hono';
import {jwtVerify} from 'jose';
import {UnauthorizedException} from '../../shared/errors/http-exception';

interface AuthMiddlewareOptions {
  jwtSecret: string;
}

export const createAuthMiddleware = (options: AuthMiddlewareOptions) => {
  return async (c: Context, next: Next) => {
    try {
      // Get the Authorization header
      const authHeader = c.req.header('Authorization');

      if (!authHeader) {
        throw new UnauthorizedException('Authorization header is required');
      }

      // Check if the header starts with Bearer
      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid authorization header format');
      }

      // Verify the JWT token
      const {payload} = await jwtVerify(token, new TextEncoder().encode(options.jwtSecret));

      // Check if the token has a valid user ID
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      // Add user ID to context for later use
      c.set('userId', payload.sub as string);

      // Continue to the next middleware/handler
      await next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Token verification failed: ${(error as Error).message}`);
    }
  };
};
