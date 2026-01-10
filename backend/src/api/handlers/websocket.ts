// api/handlers/websocket.ts
import {Hono} from 'hono';
import {WebSocketErrors} from '../../shared/errors/websocket-errors';
import {WebSocketService} from '../../core/services/websocket-service';

const router = new Hono();
const websocketService = new WebSocketService();

/**
 * WebSocket connection handling
 * GET /ws/v1/todo/:id
 */
router.get('/todo/:id', async (c) => {
  const todoId = c.req.param('id');
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new WebSocketErrors.WebSocketAuthError('Missing authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // Verify user identity
    const user = await websocketService.authenticateConnection(token, c.env);

    // Check TODO access permissions
    const hasAccess = await websocketService.verifyTodoAccess(todoId, user.id, c.env);

    if (!hasAccess) {
      throw new WebSocketErrors.WebSocketAuthError('No access to this todo');
    }

    // 创建WebSocket连接
    // 注意：在实际部署中，这里应该创建Durable Object来处理WebSocket连接
    // 由于Cloudflare Workers的限制，我们这里返回一个占位符响应

    return c.json({
      message: 'WebSocket endpoint',
      todo_id: todoId,
      user_id: user.id,
      note: 'In production, this would upgrade to a WebSocket connection',
    });
  } catch (error) {
    if (error instanceof WebSocketErrors.WebSocketAuthError) {
      return c.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        401,
      );
    }

    console.error('WebSocket connection error:', error);

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to establish WebSocket connection',
        },
      },
      500,
    );
  }
});

export default router;
