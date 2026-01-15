import {Hono} from 'hono';
import {HTTPException} from 'hono/http-exception';
import {HonoAppType} from './shared/types/hono-types';

import {corsMiddleware} from './api/middleware/cors';
import {globalRateLimit} from './api/middleware/rate-limit';

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
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found',
          },
        },
        404,
      );
    });

    this.app.onError((error: unknown, c) => {
      if (error instanceof HTTPException) {
        console.error('HTTPException:', error.message);
        return error.getResponse();
      }
      
      console.error('Unhandled error:', error);
      return c.json(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An internal server error occurred',
          },
        },
        500,
      );
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
