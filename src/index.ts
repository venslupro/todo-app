import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { csrf } from 'hono/csrf';
import { prettyJSON } from 'hono/pretty-json';

import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import teamRoutes from './routes/teams';
import { ssrHandler } from './ssr';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.pages.dev'],
  credentials: true
}));
app.use('*', csrf());
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/todos', todoRoutes);
app.route('/api/v1/teams', teamRoutes);

// Static assets
app.get('/assets/*', serveStatic({ 
  root: './dist/client',
  manifest: {} as any
}));

// SSR handler for all other routes
app.get('*', ssrHandler);

export default app;