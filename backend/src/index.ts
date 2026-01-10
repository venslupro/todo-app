// index.ts
import {Hono} from 'hono';

// 导入中间件
import {errorMiddleware} from './api/middleware/error';
import {corsMiddleware} from './api/middleware/cors';
import {authMiddleware} from './api/middleware/auth';
import {globalRateLimit} from './api/middleware/rate-limit';

// 导入处理器
import systemRoutes from './api/handlers/system';
import authRoutes from './api/handlers/auth';
import todoRoutes from './api/handlers/todo';
import mediaRoutes from './api/handlers/media';
import teamRoutes from './api/handlers/team';
import websocketRoutes from './api/handlers/websocket';

// 创建Hono应用
const app = new Hono<{
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_ANON_KEY: string;
    ENVIRONMENT: 'development' | 'production' | 'staging';
  };
  Variables: {
    user: {
      id: string;
      email: string;
      username?: string;
      full_name?: string;
      avatar_url?: string;
    };
  };
}>();

// 全局中间件
app.use('*', corsMiddleware);
app.use('*', errorMiddleware);

// 系统路由（无需认证）
app.route('/', systemRoutes);
app.route('/api/v1/auth', authRoutes);

// API路由（需要认证）
app.use('/api/v1/*', authMiddleware);
app.use('/api/v1/*', globalRateLimit);
app.route('/api/v1/todos', todoRoutes);
app.route('/api/v1/media', mediaRoutes);
app.route('/api/v1/team', teamRoutes);

// WebSocket路由
app.route('/ws/v1', websocketRoutes);

// 404处理
app.notFound((c) => {
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

export default app;
