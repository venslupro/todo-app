import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SupabaseDriver } from './drivers/supabase';
import { AuthService } from './core/services/auth.service';
import { TodoService } from './core/services/todo.service';
import { MediaService } from './core/services/media.service';
import { AuthHandler } from './api/handlers/auth.handler';
import { TodoHandler } from './api/handlers/todo.handler';
import { MediaHandler } from './api/handlers/media.handler';
import { SystemHandler } from './api/handlers/system.handler';
import { authMiddleware } from './api/middleware/auth.middleware';
import { errorMiddleware } from './api/middleware/error.middleware';
import { AppConfig } from './shared/types/common';

export class TodoApp {
  private app: Hono;
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.app = new Hono();
    this.config = config;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use('*', cors());
    this.app.use('*', errorMiddleware);
  }

  private setupRoutes() {
    const supabaseDriver = new SupabaseDriver(this.config);

    const authService = new AuthService(supabaseDriver);
    const todoService = new TodoService(supabaseDriver);
    const mediaService = new MediaService(supabaseDriver);

    const systemHandler = new SystemHandler();
    const authHandler = new AuthHandler(authService);
    const todoHandler = new TodoHandler(todoService);
    const mediaHandler = new MediaHandler(mediaService);

    // System routes
    this.app.get('/', systemHandler.root);
    this.app.get('/health', systemHandler.healthCheck);
    this.app.get('/version', systemHandler.versionInfo);

    // Auth routes
    const authRoutes = this.app.basePath('/api/v1/auth');
    authRoutes.post('/register', authHandler.register);
    authRoutes.post('/login', authHandler.login);
    authRoutes.post('/refresh', authHandler.refreshToken);
    authRoutes.post('/logout', authMiddleware, authHandler.logout);
    authRoutes.get('/profile', authMiddleware, authHandler.getProfile);

    // TODO routes
    const todoRoutes = this.app.basePath('/api/v1/todos').use(authMiddleware);
    todoRoutes.get('/', todoHandler.getAllTodos);
    todoRoutes.post('/', todoHandler.createTodo);
    todoRoutes.get('/:id', todoHandler.getTodoById);
    todoRoutes.put('/:id', todoHandler.updateTodo);
    todoRoutes.delete('/:id', todoHandler.deleteTodo);

    // Media routes
    const mediaRoutes = this.app.basePath('/api/v1/media').use(authMiddleware);
    mediaRoutes.get('/', mediaHandler.getAllMedia);
    mediaRoutes.post('/upload-url', mediaHandler.generateUploadUrl);
    mediaRoutes.post('/:id/confirm', mediaHandler.confirmUpload);
    mediaRoutes.delete('/:id', mediaHandler.deleteMedia);
  }

  getApp(): Hono {
    return this.app;
  }
}
