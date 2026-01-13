// index.ts
import {Hono} from 'hono';
import {HonoAppType} from './shared/types/hono-types';

// Import middleware
import {errorMiddleware} from './api/middleware/error';
import {corsMiddleware} from './api/middleware/cors';
import {authMiddleware} from './api/middleware/auth';
import {globalRateLimit} from './api/middleware/rate-limit';

// Import handlers
import systemRoutes from './api/handlers/system';
import authRoutes from './api/handlers/auth';
import todoRoutes from './api/handlers/todo';
import mediaRoutes from './api/handlers/media';
import teamRoutes from './api/handlers/team';
import websocketRoutes from './api/handlers/websocket';

// Create Hono application
const app = new Hono<HonoAppType>();

// Global middleware
app.use('*', corsMiddleware);
app.use('*', errorMiddleware);

// System routes (no authentication required)
app.route('/', systemRoutes);

// Authentication routes (no authentication required)
app.route('/api/v1/auth', authRoutes);

// API routes (authentication required) - exclude authentication routes
app.use('/api/v1/todos/*', authMiddleware);
app.use('/api/v1/todos/*', globalRateLimit);
app.use('/api/v1/media/*', authMiddleware);
app.use('/api/v1/media/*', globalRateLimit);
app.use('/api/v1/team/*', authMiddleware);
app.use('/api/v1/team/*', globalRateLimit);
app.route('/api/v1/todos', todoRoutes);
app.route('/api/v1/media', mediaRoutes);
app.route('/api/v1/team', teamRoutes);

// WebSocket routes
app.route('/ws/v1', websocketRoutes);

// 404 handling
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
