import { Context } from 'hono';
import { AppException } from '../../shared/exceptions/app.exception';
import { ApiResponseBuilder } from '../../shared/types/api.response';

export abstract class BaseHandler {
  protected success<T>(c: Context, data: T, message: string = 'Success'): Response {
    const response = ApiResponseBuilder.success(data, message);
    return c.json(response, 200);
  }

  protected created<T>(c: Context, data: T, message: string = 'Created'): Response {
    const response = ApiResponseBuilder.created(data, message);
    return c.json(response, 201);
  }

  protected noContent(c: Context, message: string = 'No Content'): Response {
    const response = ApiResponseBuilder.noContent(message);
    return c.json(response, 204);
  }

  protected badRequest(c: Context, message: string, details?: unknown): Response {
    const error = AppException.badRequest(message, details);
    throw error;
  }

  protected unauthorized(c: Context, message: string = 'Unauthorized', details?: unknown): Response {
    const error = AppException.unauthorized(message, details);
    throw error;
  }

  protected forbidden(c: Context, message: string = 'Forbidden', details?: unknown): Response {
    const error = AppException.forbidden(message, details);
    throw error;
  }

  protected notFound(c: Context, message: string = 'Not Found', details?: unknown): Response {
    const error = AppException.notFound(message, details);
    throw error;
  }

  protected conflict(c: Context, message: string = 'Conflict', details?: unknown): Response {
    const error = AppException.conflict(message, details);
    throw error;
  }

  protected unprocessableEntity(c: Context, message: string = 'Validation Failed', details?: unknown): Response {
    const error = AppException.unprocessableEntity(message, details);
    throw error;
  }

  protected internalError(c: Context, message: string = 'Internal Server Error', details?: unknown): Response {
    const error = AppException.internalError(message, details);
    throw error;
  }

  protected getUserId(c: Context): string {
    const userId = (c as any).get?.('userId');
    if (!userId) {
      throw AppException.unauthorized('User ID not found in context');
    }
    return userId;
  }

  protected getAccessToken(c: Context): string {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppException.unauthorized('Missing or invalid Authorization header');
    }
    return authHeader.substring(7);
  }

  protected handleZodError(result: any, _c: Context): Response | null {
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue?.message || 'Invalid request data';
      const details = result.error.issues.map((issue: any) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      const error = AppException.unprocessableEntity(message, details);
      throw error;
    }
    return null;
  }
}
