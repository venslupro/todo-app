// api/handlers/websocket.ts
import {Hono} from 'hono';
import {WebSocketErrors} from '../../shared/errors/websocket-errors';
import {WebSocketService} from '../../core/services/websocket-service';
import {AppConfig} from '../../shared/config/config';
import type {HonoAppType} from '../../shared/types/hono-types';

const router = new Hono<HonoAppType>();

const websocketService = new WebSocketService();

/**
 * WebSocket connection handling using Durable Objects
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
    // Create AppConfig instance from environment
    const appConfig = new AppConfig({
      supabase_url: c.env?.['supabase_url'] || '',
      supabase_anon_key: c.env?.['supabase_anon_key'] || '',
      supabase_service_role_key: c.env?.['supabase_service_role_key'] || '',
      environment: (c.env?.['environment'] as 'development' | 'production' | 'staging') || 'development',
    });

    // Verify user identity
    const user = await websocketService.authenticateConnection(token, appConfig);

    // Check TODO access permissions
    const hasAccess = await websocketService.verifyTodoAccess(todoId, user.id, appConfig);

    if (!hasAccess) {
      throw new WebSocketErrors.WebSocketAuthError('No access to this todo');
    }

    // 使用Durable Objects处理WebSocket连接
    if (!c.env.TODO_WEBSOCKET) {
      throw new Error('Durable Objects not configured');
    }

    // 获取Durable Object ID（基于TODO ID）
    const durableObjectId = c.env.TODO_WEBSOCKET.idFromName(todoId);
    
    // 获取Durable Object stub
    const durableObjectStub = c.env.TODO_WEBSOCKET.get(durableObjectId);
    
    // 构建WebSocket连接URL
    const websocketUrl = new URL('https://dummy-url/websocket');
    websocketUrl.searchParams.set('todoId', todoId);
    
    // 创建WebSocket连接请求
    const websocketRequest = new Request(websocketUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Upgrade': 'websocket',
      },
    });

    // 转发请求到Durable Object
    return durableObjectStub.fetch(websocketRequest);

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

/**
 * 获取TODO房间的用户列表
 * GET /ws/v1/todo/:id/users
 */
router.get('/todo/:id/users', async (c) => {
  const todoId = c.req.param('id');
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new WebSocketErrors.WebSocketAuthError('Missing authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // Create AppConfig instance from environment
    const appConfig = new AppConfig({
      supabase_url: c.env?.['supabase_url'] || '',
      supabase_anon_key: c.env?.['supabase_anon_key'] || '',
      supabase_service_role_key: c.env?.['supabase_service_role_key'] || '',
      environment: (c.env?.['environment'] as 'development' | 'production' | 'staging') || 'development',
    });

    // Verify user identity
    const user = await websocketService.authenticateConnection(token, appConfig);

    // Check TODO access permissions
    const hasAccess = await websocketService.verifyTodoAccess(todoId, user.id, appConfig);

    if (!hasAccess) {
      throw new WebSocketErrors.WebSocketAuthError('No access to this todo');
    }

    // 获取TODO房间的用户列表
    const users = await websocketService.getTodoRoomUsers(todoId, appConfig);

    return c.json({
      todo_id: todoId,
      users,
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

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch room users',
        },
      },
      500,
    );
  }
});

/**
 * 发送消息到TODO房间
 * POST /ws/v1/todo/:id/message
 */
router.post('/todo/:id/message', async (c) => {
  const todoId = c.req.param('id');
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new WebSocketErrors.WebSocketAuthError('Missing authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // Create AppConfig instance from environment
    const appConfig = new AppConfig({
      supabase_url: c.env?.['supabase_url'] || '',
      supabase_anon_key: c.env?.['supabase_anon_key'] || '',
      supabase_service_role_key: c.env?.['supabase_service_role_key'] || '',
      environment: (c.env?.['environment'] as 'development' | 'production' | 'staging') || 'development',
    });

    // Verify user identity
    const user = await websocketService.authenticateConnection(token, appConfig);

    // Check TODO access permissions
    const hasAccess = await websocketService.verifyTodoAccess(todoId, user.id, appConfig);

    if (!hasAccess) {
      throw new WebSocketErrors.WebSocketAuthError('No access to this todo');
    }

    // 解析消息体
    const messageData = await c.req.json();
    
    // 获取Durable Object ID
    if (!c.env.TODO_WEBSOCKET) {
      throw new Error('Durable Objects not configured');
    }
    const durableObjectId = c.env.TODO_WEBSOCKET.idFromName(todoId);
    
    // 获取Durable Object stub
    const durableObjectStub = c.env.TODO_WEBSOCKET.get(durableObjectId);
    
    // 构建消息发送请求
    const messageRequest = new Request(`https://dummy-url/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'message',
        payload: messageData,
        timestamp: Date.now(),
        sender: user.id,
      }),
    });

    // 转发消息到Durable Object
    const response = await durableObjectStub.fetch(messageRequest);
    
    if (response.ok) {
      return c.json({
        message: 'Message sent successfully',
        todo_id: todoId,
      });
    } else {
      throw new Error('Failed to send message');
    }

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

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message',
        },
      },
      500,
    );
  }
});

export default router;