// api/middleware/error.ts
import {Context, Next} from 'hono';
import {BaseError} from '../../shared/errors/base-error';

/**
 * 错误处理中间件
 */
export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof BaseError) {
      return c.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        error.statusCode || 500,
      );
    }

    // 未知错误
    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      500,
    );
  }

  return;
};
