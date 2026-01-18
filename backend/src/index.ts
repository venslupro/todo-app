import { Hono } from 'hono';
import { TodoApp } from './app';
import { AppConfig } from './shared/types/common';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ENVIRONMENT?: string;
  LOG_LEVEL?: string;
}

const app = new Hono();

app.use('*', async (c) => {
  const env = c.env as any;
  
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ error: 'Missing required environment variables' }, 500);
  }

  const config: AppConfig = {
    environment: env.ENVIRONMENT || 'development',
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    logLevel: env.LOG_LEVEL || 'info',
  };

  const todoApp = new TodoApp(config);
  return todoApp.getApp().fetch(c.req.raw, env);
});

export default app;