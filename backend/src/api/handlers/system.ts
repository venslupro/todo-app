// api/handlers/system.ts
import {Hono} from 'hono';
import {SuccessResponse} from '../../shared/errors/http-exception';
import {SupabaseConfig} from '../../shared/types/hono-types';
import {BusinessLogger} from '../middleware/logger';

const router = new Hono<{
  Bindings: SupabaseConfig;
  Variables: {};
}>();

/**
 * Health check
 * GET /
 */
router.get('/', (c) => {
  BusinessLogger.info('Health check requested', {
    environment: c.env.environment || 'unknown',
    timestamp: new Date().toISOString()
  });
  
  const response = new SuccessResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.environment || 'unknown',
  });
  return response.getResponse();
});

/**
 * Health check
 * GET /health
 */
router.get('/health', (c) => {
  const response = new SuccessResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.environment || 'unknown',
  });
  return response.getResponse();
});

/**
 * Version information
 * GET /version
 */
router.get('/version', () => {
  const response = new SuccessResponse({
    name: 'TODO API',
    version: '1.0.0',
    description: 'Real-time collaborative TODO list application',
    documentation: 'https://api.todo.com/docs',
  });
  return response.getResponse();
});

export default router;
