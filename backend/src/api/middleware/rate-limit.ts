// api/middleware/rate-limit.ts
import {Context, Next} from 'hono';
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
      throw new Error(
        `Rate limit exceeded. Try again in ${result.reset - Math.floor(Date.now() / 1000)} seconds`,
      );
    }

    // 添加速率限制头
    c.header('X-RateLimit-Limit', options.limit.toString());
    c.header('X-RateLimit-Remaining', result.remaining.toString());
    c.header('X-RateLimit-Reset', result.reset.toString());

    await next();
  };
};

/**
 * 全局速率限制中间件（默认配置）
 */
export const globalRateLimit = rateLimitMiddleware({
  limit: 100, // 每分钟100次请求
  windowSeconds: 60, // 1分钟窗口
});

/**
 * 严格速率限制中间件（用于敏感操作）
 */
export const strictRateLimit = rateLimitMiddleware({
  limit: 10, // 每分钟10次请求
  windowSeconds: 60,
});

/**
 * 宽松速率限制中间件（用于公共API）
 */
export const looseRateLimit = rateLimitMiddleware({
  limit: 1000, // 每分钟1000次请求
  windowSeconds: 60,
});
