import { Context, Next } from 'hono';
import { ZodError } from 'zod';
import { AppException } from '../../shared/exceptions/app.exception';
import { ApiResponseBuilder } from '../../shared/types/api.response';

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error: unknown) {
    console.error('Error:', error);

    if (error instanceof AppException) {
      const errorResponse = ApiResponseBuilder.fromException(error);
      return c.json(errorResponse, error.code);
    }

    if (error instanceof ZodError) {
      const validationError = AppException.unprocessableEntity(
        'Validation failed',
        error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
      const errorResponse = ApiResponseBuilder.fromException(validationError);
      return c.json(errorResponse, validationError.code);
    }

    if (error instanceof Error) {
      const internalError = AppException.internalError(error.message);
      const errorResponse = ApiResponseBuilder.fromException(internalError);
      return c.json(errorResponse, internalError.code);
    }

    const internalError = AppException.internalError('Internal Server Error');
    const errorResponse = ApiResponseBuilder.fromException(internalError);
    return c.json(errorResponse, internalError.code);
  }
};
