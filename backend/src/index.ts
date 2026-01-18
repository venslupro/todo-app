import { Hono } from 'hono';
import { TodoApp } from './app';
import { AppConfig } from './shared/types/common';

const app = new Hono();

app.use('*', async (c) => {
  const env = c.env as Record<string, string>;

  if (!env?.supabase_url || !env?.supabase_anon_key || !env?.supabase_service_role_key) {
    return c.json({ error: 'Missing required environment variables' }, 500);
  }

  const config: AppConfig = {
    environment: (env.environment as any) || 'development',
    supabaseUrl: env.supabase_url,
    supabaseAnonKey: env.supabase_anon_key,
    supabaseServiceRoleKey: env.supabase_service_role_key,
    logLevel: (env.log_level as any) || 'info',
  };

  const todoApp = new TodoApp(config);
  return todoApp.getApp().fetch(c.req.raw, env);
});

export default app;
