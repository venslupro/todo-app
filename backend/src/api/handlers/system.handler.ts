import { Context } from 'hono';
import { BaseHandler } from './base.handler';

export class SystemHandler extends BaseHandler {
  private getEnvironment(c: Context): string {
    const env = c.env as any;
    return env.ENVIRONMENT || 'development';
  }

  healthCheck = async (c: Context) => {
    const supabaseUrl = (c.env as any).SUPABASE_URL;
    const isHealthy = !!supabaseUrl;

    return this.success(c, {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: this.getEnvironment(c),
    });
  };

  versionInfo = async (c: Context) => {
    return this.success(c, {
      name: 'TODO API',
      version: '1.0.0',
      environment: this.getEnvironment(c),
    });
  };

  root = async (c: Context) => {
    return this.success(c, {
      name: 'TODO API',
      version: '1.0.0',
      environment: this.getEnvironment(c),
      timestamp: new Date().toISOString(),
    });
  };
}
