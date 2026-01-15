// api/middleware/rate-limit.ts
import {Context, Next} from 'hono';
import {HTTPException} from 'hono/http-exception';
import {RateLimitService} from '../../core/services/rate-limit-service';

/**
 * Rate limiting middleware factory function
 */
export const rateLimitMiddleware = (options: {
  limit: number;
  windowSeconds: number;
  identifier?: string | ((c: Context) => string);
}) => {
  return async (c: Context, next: Next) => {
    const rateLimitService = new RateLimitService(c.env);

    // Determine identifier
    let identifier: string;
    if (typeof options.identifier === 'function') {
      identifier = options.identifier(c);
    } else if (options.identifier) {
      identifier = options.identifier;
    } else {
      // Default to IP address
      identifier =
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-forwarded-for') ||
        'unknown';
    }

    // Check rate limit
    const result = await rateLimitService.checkRateLimit(
      identifier,
      options.limit,
      options.windowSeconds,
    );

    if (!result.allowed) {
      throw new HTTPException(429, {
        message: `Rate limit exceeded. Try again in ${
          result.reset - Math.floor(Date.now() / 1000)
        } seconds`,
      });
    }

    // Add rate limit headers
    c.header('X-RateLimit-Limit', options.limit.toString());
    c.header('X-RateLimit-Remaining', result.remaining.toString());
    c.header('X-RateLimit-Reset', result.reset.toString());

    await next();
  };
};

/**
 * Global rate limit middleware (default configuration)
 */
export const globalRateLimit = rateLimitMiddleware({
  limit: 100, // 100 requests per minute
  windowSeconds: 60, // 1 minute window
});

/**
 * Strict rate limit middleware (for sensitive operations)
 */
export const strictRateLimit = rateLimitMiddleware({
  limit: 10, // 10 requests per minute
  windowSeconds: 60,
});

/**
 * Loose rate limit middleware (for public APIs)
 */
export const looseRateLimit = rateLimitMiddleware({
  limit: 1000, // 1000 requests per minute
  windowSeconds: 60,
});
