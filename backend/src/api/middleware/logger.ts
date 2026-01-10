// api/middleware/logger.ts
import {Context, Next} from 'hono';

/**
 * 日志中间件
 */
export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(`${method} ${url} - ${status} (${duration}ms)`);
};
