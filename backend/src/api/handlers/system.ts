// api/handlers/system.ts
import {Hono} from 'hono';
import {HttpErrors} from '../../shared/errors/http-errors';

const router = new Hono<{
  Bindings: {
    supabase_url: string;
    supabase_service_role_key: string;
    supabase_anon_key: string;
    environment: 'development' | 'production' | 'staging';
  };
  Variables: {};
}>();

/**
 * Health check
 * GET /
 */
router.get('/', (c) => {
  return c.json(
    new HttpErrors.OkResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: (c.env as any)['ENVIRONMENT'] || 'unknown',
    }),
  );
});

/**
 * Health check
 * GET /health
 */
router.get('/health', (c) => {
  return c.json(
    new HttpErrors.OkResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: (c.env as any)['ENVIRONMENT'] || 'unknown',
    }),
  );
});

/**
 * 版本信息
 * GET /version
 */
router.get('/version', (c) => {
  return c.json(
    new HttpErrors.OkResponse({
      name: 'TODO API',
      version: '1.0.0',
      description: 'Real-time collaborative TODO list application',
      documentation: 'https://api.example.com/docs',
    }),
  );
});

export default router;
