import {Hono} from 'hono';
import {HTTPException} from 'hono/http-exception';
import {HonoAppType} from './shared/types/hono-types';
import {InternalServerException, NotFoundException} from './shared/errors/http-exception';
import {BusinessLogger} from './api/middleware/logger';

import {corsMiddleware} from './api/middleware/cors';
import {globalRateLimit} from './api/middleware/rate-limit';
import {loggerMiddleware} from './api/middleware/logger';

import systemRoutes from './api/handlers/system';
import authRoutes from './api/handlers/auth';
import todoRoutes from './api/handlers/todo';
import mediaRoutes from './api/handlers/media';
import teamRoutes from './api/handlers/team';
// import websocketRoutes from './api/handlers/websocket'; // WebSocket temporarily disabled

// Durable Objects exports (temporarily disabled)
// export {TodoWebSocketDurableObject} from './core/durable-objects/todo-websocket';

/**
 * Application router class that organizes all routes and middleware.
 */
class ApplicationRouter {
  private app: Hono<HonoAppType>;

  constructor() {
    this.app = new Hono<HonoAppType>();
    this.setupGlobalMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Sets up global middleware for the application.
   */
  private setupGlobalMiddleware(): void {
    this.app.use('*', loggerMiddleware);
    this.app.use('*', corsMiddleware);
  }

  /**
   * Sets up all application routes.
   */
  private setupRoutes(): void {
    // System routes (no authentication required)
    this.app.route('/', systemRoutes);

    // Authentication routes (no authentication required)
    this.app.route('/api/v1/auth', authRoutes);

    // Protected API routes
    this.setupProtectedRoutes();

    // WebSocket routes (temporarily disabled)
    // this.app.route('/ws/v1', websocketRoutes);
  }

  /**
   * Sets up protected routes with authentication and rate limiting.
   */
  private setupProtectedRoutes(): void {
    const protectedRoutes = [
      {path: '/api/v1/todos', handler: todoRoutes},
      {path: '/api/v1/media', handler: mediaRoutes},
      {path: '/api/v1/team', handler: teamRoutes},
    ];

    protectedRoutes.forEach((route) => {
      this.app.use(`${route.path}/*`, globalRateLimit);
      this.app.route(route.path, route.handler);
    });
  }

  /**
   * Sets up error handling for the application.
   */
  private setupErrorHandling(): void {
    this.app.notFound((c) => {
      BusinessLogger.warn('Requested resource not found', {
        path: c.req.path,
        method: c.req.method,
        environment: c.env.environment || 'unknown',
        userAgent: c.req.header('User-Agent') || 'unknown',
      });
      const exception = new NotFoundException('The requested resource was not found');
      return exception.getResponse();
    });

    this.app.onError((error: unknown, c) => {
      if (error instanceof HTTPException) {
        BusinessLogger.warn('HTTP exception occurred', {
          path: c.req.path,
          method: c.req.method,
          statusCode: error.status,
          errorMessage: error.message,
          environment: c.env.environment || 'unknown',
          clientIp: c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown',
        });
        return error.getResponse();
      }

      BusinessLogger.error('Unhandled error occurred', error as Error, {
        path: c.req.path,
        method: c.req.method,
        environment: c.env.environment || 'unknown',
        clientIp: c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown',
        userAgent: c.req.header('User-Agent') || 'unknown',
        stackTrace: error instanceof Error ? error.stack : 'No stack trace',
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const exception = new InternalServerException(errorMessage);
      return exception.getResponse();
    });
  }

  /**
   * Returns the Hono application instance.
   */
  public getApp(): Hono<HonoAppType> {
    return this.app;
  }
}

// Create and export the application
const router = new ApplicationRouter();
const app = router.getApp();

export default app;
