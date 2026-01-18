import { Context } from 'hono';

export abstract class BaseHandler {
  protected success<T>(c: Context, data: T): Response {
    return c.json(data as any, 200);
  }

  protected created<T>(c: Context, data: T): Response {
    return c.json(data as any, 201);
  }

  protected noContent(c: Context): Response {
    return c.body(null, 204);
  }

  protected badRequest(c: Context, message: string): Response {
    return c.json({ error: message }, 400);
  }

  protected unauthorized(c: Context, message: string = 'Unauthorized'): Response {
    return c.json({ error: message }, 401);
  }

  protected forbidden(c: Context, message: string = 'Forbidden'): Response {
    return c.json({ error: message }, 403);
  }

  protected notFound(c: Context, message: string = 'Not Found'): Response {
    return c.json({ error: message }, 404);
  }

  protected conflict(c: Context, message: string = 'Conflict'): Response {
    return c.json({ error: message }, 409);
  }

  protected unprocessableEntity(c: Context, message: string = 'Validation Failed'): Response {
    return c.json({ error: message }, 422);
  }

  protected internalError(c: Context, message: string = 'Internal Server Error'): Response {
    return c.json({ error: message }, 500);
  }

  protected getUserId(c: Context): string {
    const userId = (c as any).get?.('userId');
    if (!userId) {
      throw new Error('User ID not found in context');
    }
    return userId;
  }

  protected getAccessToken(c: Context): string {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }
    return authHeader.substring(7);
  }

  protected handleZodError(result: any, c: Context): Response | null {
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue?.message || 'Invalid request data';
      return this.unprocessableEntity(c, message);
    }
    return null;
  }
}
