// backend/src/app.ts
import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {logger} from 'hono/logger';
import {secureHeaders} from 'hono/secure-headers';
import {errorMiddleware, corsMiddleware, loggerMiddleware, rateLimitMiddleware} from './shared/validation/middleware';
import restRoutes from './api/rest';
import websocketRoutes from './api/websocket';

// 创建Hono应用
const app = new Hono<{
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_ANON_KEY: string;
    KV_STORE: KVNamespace;
    ENVIRONMENT: 'development' | 'production' | 'staging';
  };
  Variables: {
    user: any; // 认证用户信息
  };
}>();

// 全局中间件
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', corsMiddleware);
app.use('*', errorMiddleware);

// 健康检查端点
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown',
  });
});

// 版本信息
app.get('/version', (c) => {
  return c.json({
    name: 'TODO API',
    version: '1.0.0',
    description: 'Real-time collaborative TODO list application',
    docs: 'https://api.example.com/docs',
  });
});

// 注册REST API路由
app.route('/api/v1', restRoutes);

// 注册WebSocket路由
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