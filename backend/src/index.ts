// src/index.ts
// Main application entry point

import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {logger as httpLogger} from 'hono/logger';
import {HTTPException} from 'hono/http-exception';
import {appLogger} from './shared/utils/logger';

/**
 * Bindings for Cloudflare Workers environment variables
 */
type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  LOG_LEVEL: string;
};

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

// Initialize drivers
const supabaseDriver = createSupabaseDriver({
  url: process.env.supabase_url || '',
  anonKey: process.env.supabase_anon_key || '',
  serviceRoleKey: process.env.supabase_service_role_key || '',
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
  environment: process.env.ENVIRONMENT || 'development',
  appName: 'TODO API',
  appVersion: '1.0.0',
});

const authService = createAuthService({authDriver});
const todoService = createTodoService({todoDriver, teamDriver});
const mediaService = createMediaService({mediaDriver, teamDriver});
const teamService = createTeamService({teamDriver});

// Initialize handlers
const systemHandler = createSystemHandler({systemService});
const authHandler = createAuthHandler({authService});
const todoHandler = createTodoHandler({todoService});
const mediaHandler = createMediaHandler({mediaService});
const teamHandler = createTeamHandler({teamService});

// Auth middleware (use this for protected routes)
const authMiddleware = createAuthMiddleware({
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
});

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
apiV1.post('/media/upload-url', authMiddleware, mediaHandler.generateUploadUrl.bind(mediaHandler));
apiV1.post('/media/:id/confirm', authMiddleware, mediaHandler.confirmUpload.bind(mediaHandler));

// Protected team routes
apiV1.get('/team/members', authMiddleware, teamHandler.getTeamMembers.bind(teamHandler));
apiV1.post('/team/share', authMiddleware, teamHandler.shareTodo.bind(teamHandler));
apiV1.put('/team/share/:id', authMiddleware, teamHandler.updateSharePermission.bind(teamHandler));
apiV1.delete('/team/share/:id', authMiddleware, teamHandler.removeShare.bind(teamHandler));

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // Return the custom HTTP exception response
    return err.getResponse();
  }

  // Default error response for unexpected errors
  return c.json({
    code: 500,
    message: 'Internal Server Error',
    details: err.message,
  }, 500);
});

// Export the app for use in Cloudflare Workers
appLogger.info('🚀 Todo API is running...');
appLogger.info('Environment:', {
  environment: process.env.ENVIRONMENT || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
});

// Export the app as a Module Worker for Cloudflare Workers
export default {
  fetch: app.fetch,
};
