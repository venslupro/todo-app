import {Context, Next} from 'hono';
import {UnauthorizedException} from '../../shared/errors/http-exception';
import {SupabaseClient} from '../../core/supabase/client';
import {AppConfig} from '../../shared/config/app-config';
import {EnvironmentConfig} from '../../shared/types/hono-types';

/**
 * User information extracted from JWT token.
 */
export type UserInfo = {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
};

/**
 * Bearer Auth middleware that validates Supabase JWT tokens and extracts user information.
 * Custom implementation following Hono's bearerAuth pattern.
 */
export class BearerAuthMiddleware {
  /**
   * Creates bearer auth middleware with Supabase token verification.
   */
  public static create() {
    return async (c: Context<{
      Bindings: EnvironmentConfig;
      Variables: { user: UserInfo };
    }>, next: Next) => {
      try {
        // Extract token from Authorization header
        const authHeader = c.req.header('Authorization');

        if (!authHeader) {
          throw new UnauthorizedException('Missing Authorization header');
        }

        if (!authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException(
            'Invalid Authorization header format. Expected: "Bearer <token>"',
          );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
          throw new UnauthorizedException('Missing token');
        }

        // Validate token format (basic regex check)
        const tokenRegex = /^[A-Za-z0-9._~+/-]+=*$/;
        if (!tokenRegex.test(token)) {
          throw new UnauthorizedException('Invalid token format');
        }

        // Verify token using Supabase
        const isValid = await this.verifySupabaseToken(token, c);

        if (!isValid) {
          throw new UnauthorizedException('Invalid or expired token');
        }

        await next();
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          return error.getResponse();
        }

        console.error('Bearer auth middleware error:', error);
        const exception = new UnauthorizedException('Authentication failed');
        return exception.getResponse();
      }
    };
  }

  /**
   * Verifies Supabase JWT token and extracts user information.
   */
  private static async verifySupabaseToken(
    token: string,
    ctx: Context<{ Bindings: EnvironmentConfig; Variables: { user: UserInfo } }>,
  ): Promise<boolean> {
    try {
      const appConfig = new AppConfig(ctx.env);
      const supabase = SupabaseClient.getClient(appConfig);

      const {data, error} = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return false;
      }

      // Extract user information and set in context
      const userInfo: UserInfo = {
        id: data.user.id,
        email: data.user.email || undefined,
        username: data.user.user_metadata?.username,
        full_name: data.user.user_metadata?.full_name,
        avatar_url: data.user.user_metadata?.avatar_url,
        role: data.user.user_metadata?.role || 'user',
      };

      // Set user info in context for use in handlers
      ctx.set('user', userInfo);

      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Creates middleware that requires specific user roles.
   */
  public static requireRole(requiredRole: string) {
    return async (c: Context<{ Variables: { user: UserInfo } }>, next: Next) => {
      const user = c.get('user');

      if (!user) {
        throw new UnauthorizedException('Authentication required');
      }

      if (user.role !== requiredRole) {
        throw new UnauthorizedException(`Insufficient permissions. Required role: ${requiredRole}`);
      }

      await next();
    };
  }

  /**
   * Creates middleware that requires at least one of the specified roles.
   */
  public static requireAnyRole(requiredRoles: string[]) {
    return async (c: Context<{ Variables: { user: UserInfo } }>, next: Next) => {
      const user = c.get('user');

      if (!user) {
        throw new UnauthorizedException('Authentication required');
      }

      if (!requiredRoles.includes(user.role || 'user')) {
        throw new UnauthorizedException(
          `Insufficient permissions. Required one of: ${requiredRoles.join(', ')}`,
        );
      }

      await next();
    };
  }
}
