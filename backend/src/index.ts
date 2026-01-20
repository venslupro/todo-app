// src/index.ts
// Main application entry point

import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {logger as httpLogger} from 'hono/logger';
import {HTTPException} from 'hono/http-exception';
import type {ExecutionContext} from '@cloudflare/workers-types';
import {createLogger} from './shared/utils/logger';

// Drivers
import {createSupabaseDriver} from './core/drivers/supabase/supabase';
import {createAuthDriver} from './core/drivers/auth';
import {createTodoDriver} from './core/drivers/todo';
import {createMediaDriver} from './core/drivers/media';
import {createTeamDriver} from './core/drivers/team';

// Services
import {createSystemService} from './core/services/system';
import {createAuthService} from './core/services/auth';
import {createTodoService} from './core/services/todo';
import {createMediaService} from './core/services/media';
import {createTeamService} from './core/services/team';

// Handlers
import {createSystemHandler} from './api/handlers/system';
import {createAuthHandler} from './api/handlers/auth';
import {createTodoHandler} from './api/handlers/todo';
import {createMediaHandler} from './api/handlers/media';
import {createTeamHandler} from './api/handlers/team';

// Middleware
import {createAuthMiddleware} from './api/middleware/auth';
import {InternalServerException} from './shared/errors/http-exception';

/**
 * Bindings for Cloudflare Workers environment variables
 */
type Bindings = {
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_role_key: string;
  environment: string;
  log_level: string;
};

// Export the app as a Module Worker for Cloudflare Workers
export default {
  fetch: async (req: Request, env: Bindings, ctx: ExecutionContext) => {
    // Create a shared logger instance with the actual environment
    const logger = createLogger({
      logLevel: env.log_level as 'error' | 'warn' | 'info' | 'debug',
      environment: env.environment,
    });

    // Initialize drivers with environment variables from env
    const supabaseDriver = createSupabaseDriver({
      url: env.supabase_url,
      anonKey: env.supabase_anon_key,
      serviceRoleKey: env.supabase_service_role_key,
    });

    const authDriver = createAuthDriver({supabase: supabaseDriver});
    const todoDriver = createTodoDriver({supabase: supabaseDriver});
    const mediaDriver = createMediaDriver({
      supabase: supabaseDriver,
      storageBucket: 'media',
    });
    const teamDriver = createTeamDriver({supabase: supabaseDriver});

    // Initialize services
    const systemService = createSystemService({
      environment: env.environment,
      appName: 'TODO API',
      appVersion: '1.0.0',
    });

    const authService = createAuthService({
      authDriver,
      logger,
    });
    const todoService = createTodoService({todoDriver, teamDriver, logger});
    const mediaService = createMediaService({mediaDriver, teamDriver, logger});
    const teamService = createTeamService({teamDriver, logger});

    // Initialize handlers
    const systemHandler = createSystemHandler({systemService});
    const authHandler = createAuthHandler({authService});
    const todoHandler = createTodoHandler({todoService});
    const mediaHandler = createMediaHandler({mediaService});
    const teamHandler = createTeamHandler({teamService});

    // Auth middleware (use this for protected routes)
    const authMiddleware = createAuthMiddleware({
      supabaseDriver: supabaseDriver,
    });

    // Initialize Hono app with Bindings type
    const app = new Hono<{Bindings: Bindings}>();

    // CORS middleware
    app.use('*', cors({
      origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
      allowHeaders: ['Authorization', 'Content-Type'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }));

    // Hono built-in logger middleware for request logging
    app.use(httpLogger());

    // System routes (public)
    app.get('/', systemHandler.healthCheck.bind(systemHandler));
    app.get('/health', systemHandler.healthCheck.bind(systemHandler));
    app.get('/version', systemHandler.version.bind(systemHandler));

    // API v1 routes
    const apiV1 = app.basePath('/api/v1');

    // Auth routes (public)
    apiV1.post('/auth/register', authHandler.register.bind(authHandler));
    apiV1.post('/auth/login', authHandler.login.bind(authHandler));
    apiV1.post('/auth/refresh', authHandler.refresh.bind(authHandler));

    // Protected auth routes
    apiV1.post('/auth/logout', authMiddleware, authHandler.logout.bind(authHandler));
    apiV1.get('/auth/profile', authMiddleware, authHandler.profile.bind(authHandler));

    // Protected todo routes
    apiV1.get('/todos', authMiddleware, todoHandler.getAllTodos.bind(todoHandler));
    apiV1.post('/todos', authMiddleware, todoHandler.createTodo.bind(todoHandler));
    apiV1.get('/todos/:id', authMiddleware, todoHandler.getTodoById.bind(todoHandler));
    apiV1.put('/todos/:id', authMiddleware, todoHandler.updateTodo.bind(todoHandler));
    apiV1.delete('/todos/:id', authMiddleware, todoHandler.deleteTodo.bind(todoHandler));

    // Protected media routes
    apiV1.get('/media', authMiddleware, mediaHandler.getAllMedia.bind(mediaHandler));
    apiV1.post('/media/upload-url', authMiddleware,
      mediaHandler.generateUploadUrl.bind(mediaHandler));
    apiV1.post('/media/:id/confirm', authMiddleware,
      mediaHandler.confirmUpload.bind(mediaHandler));

    // Protected team routes
    apiV1.get('/team/members', authMiddleware,
      teamHandler.getTeamMembers.bind(teamHandler));
    apiV1.post('/team/share', authMiddleware, teamHandler.shareTodo.bind(teamHandler));
    apiV1.put('/team/share/:id', authMiddleware,
      teamHandler.updateSharePermission.bind(teamHandler));
    apiV1.delete('/team/share/:id', authMiddleware,
      teamHandler.removeShare.bind(teamHandler));

    // Global error handler
    app.onError((err) => {
      if (err instanceof HTTPException) {
        // Return the custom HTTP exception response
        return err.getResponse();
      }

      // Default error response for unexpected errors
      const exception = new InternalServerException(err.message);
      return exception.getResponse();
    });

    // Log environment info
    logger.info('🚀 Todo API is running...');
    logger.info('Environment:', {
      environment: env.environment,
      logLevel: env.log_level,
    });

    // Handle request
    return app.fetch(req, env, ctx);
  },
};
