import {Context, Next} from 'hono';
import {UnauthorizedException} from '../../shared/errors/http-exception';
import {SupabaseClient} from '../../core/supabase/client';
import {AppConfig} from '../../shared/config/app-config';
import {EnvironmentConfig} from '../../shared/types/hono-types';

// Define JWT variables type for type safety
type JwtVariables = {
  jwtPayload: {
    sub: string;
    email?: string;
  };
};

/**
 * JWT middleware that validates Supabase Authentication tokens.
 * Extracts token from Authorization header and validates using Supabase.
 */
export const jwtMiddleware = async (c: Context<{
  Bindings: EnvironmentConfig;
  Variables: JwtVariables;
}>, next: Next) => {
  try {
    // Extract token from Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    // Validate token using Supabase
    const appConfig = new AppConfig(c.env);
    const supabase = SupabaseClient.getClient(appConfig);

    const {data, error} = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Set JWT payload in context for use in handlers
    c.set('jwtPayload', {
      sub: data.user.id,
      email: data.user.email || undefined,
    });

    await next();
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return error.getResponse();
    }

    // Log unexpected errors
    console.error('JWT middleware error:', error);
    const exception = new UnauthorizedException('Authentication failed');
    return exception.getResponse();
  }
};

/**
 * Optional JWT middleware - allows public access but sets user context if token is provided
 */
export const optionalJwtMiddleware = async (c: Context<{
  Bindings: EnvironmentConfig;
  Variables: JwtVariables;
}>, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        const appConfig = new AppConfig(c.env);
        const supabase = SupabaseClient.getClient(appConfig);

        const {data} = await supabase.auth.getUser(token);

        if (data.user) {
          c.set('jwtPayload', {
            sub: data.user.id,
            email: data.user.email || undefined,
          });
        }
      }
    }

    await next();
  } catch (error) {
    // For optional middleware, we ignore errors and continue
    await next();
  }
};
