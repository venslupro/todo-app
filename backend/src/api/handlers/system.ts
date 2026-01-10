// api/handlers/system.ts
import {Hono} from 'hono';
import {HttpErrors} from '../../shared/errors/http-errors';

const router = new Hono();

/**
 * 健康检查
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
 * 健康检查
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
