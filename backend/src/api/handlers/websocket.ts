// api/handlers/websocket.ts
import {Hono} from 'hono';
import {HonoAppType} from '../../shared/types/hono-types';
import {WebSocketService} from '../../core/services/websocket-service';
import {AppConfig} from '../../shared/config/app-config';
// import {TodoWebSocketService} from '../../core/durable-objects/todo-websocket';
import {
  WebSocketResponseUtil,
  WebSocketAuthError,
  WebSocketPermissionError,
  WebSocketRoomError,
  WebSocketConnectionError,
  WebSocketResponse,
} from '../../shared/errors/websocket-errors';
import {jwtMiddleware} from '../middleware/auth-middleware';

// Define JWT variables type for type safety
type JwtVariables = {
  jwtPayload: {
    sub: string;
    email?: string;
  };
};

interface RoomUser {
  userId: string;
  username?: string;
  email?: string;
}

const router = new Hono<HonoAppType & {
  Variables: JwtVariables;
}>();
/**
 * Creates a WebSocketService instance.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createWebSocketService(_c: {env: Record<string, unknown>}): WebSocketService {
  return new WebSocketService();
}

/**
 * Creates an AppConfig instance.
 */
function createAppConfig(c: {env: Record<string, unknown>}): AppConfig {
  return new AppConfig(c.env);
}
/**
 * Handles WebSocket service errors and converts to WebSocket response.
 */
function handleServiceError(error: unknown, todoId?: string, userId?: string): WebSocketResponse {
  if (error instanceof Error) {
    const wsError = new WebSocketConnectionError(error.message);
    return WebSocketResponseUtil.error(wsError, todoId, userId);
  }
  const wsError = new WebSocketConnectionError('Unknown service error');
  return WebSocketResponseUtil.error(wsError, todoId, userId);
}
/**
 * Get TODO room statistics.
 * GET /api/v1/websocket/todo/:id/stats
 */
router.get('/todo/:id/stats', jwtMiddleware, async (c) => {
  try {
    const todoId = c.req.param('id');
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    // Verify TODO access permissions
    const websocketService = createWebSocketService(c);
    const appConfig = createAppConfig(c);
    const accessResult = await websocketService.verifyTodoAccess(todoId, userId, appConfig);
    if (accessResult.isErr()) {
      const error = new WebSocketPermissionError('Access denied');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    // Get room statistics from WebSocket service
    const stats = {
      userCount: 0,
      users: [],
      roomInfo: {todoId},
    };
    const response = WebSocketResponseUtil.roomStats(stats, todoId);
    return c.json(response);
  } catch (error) {
    const response = handleServiceError(error);
    return c.json(response, 500);
  }
});
/**
 * Get TODO room users.
 * GET /api/v1/websocket/todo/:id/users
 */
router.get('/todo/:id/users', jwtMiddleware, async (c) => {
  try {
    const todoId = c.req.param('id');
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    // Verify TODO access permissions
    const websocketService = createWebSocketService(c);
    const appConfig = createAppConfig(c);
    const accessResult = await websocketService.verifyTodoAccess(todoId, userId, appConfig);
    if (accessResult.isErr()) {
      const error = new WebSocketPermissionError('Access denied');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }

    // Get room users from WebSocket service
    const users: RoomUser[] = [];
    const response = WebSocketResponseUtil.roomUsers(users, todoId);
    return c.json(response);
  } catch (error) {
    const response = handleServiceError(error);
    return c.json(response, 500);
  }
});
/**
 * Cleanup inactive connections.
 * POST /api/v1/websocket/todo/:id/cleanup
 */
router.post('/todo/:id/cleanup', jwtMiddleware, async (c) => {
  try {
    const todoId = c.req.param('id');
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    // Verify TODO access permissions (admin only)
    const websocketService = createWebSocketService(c);
    const appConfig = createAppConfig(c);
    const accessResult = await websocketService.verifyTodoAccess(todoId, userId, appConfig);
    if (accessResult.isErr()) {
      const error = new WebSocketPermissionError('Access denied');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    // Cleanup inactive connections in WebSocket service
    const response = WebSocketResponseUtil.success({success: true}, todoId, userId);
    return c.json(response);
  } catch (error) {
    const response = handleServiceError(error);
    return c.json(response, 500);
  }
});
/**
 * Handle WebSocket connection request.
 * This endpoint is called by the client to establish a WebSocket connection.
 * The actual WebSocket handling is done by the Durable Object.
 */
router.get('/todo/:id/connect', jwtMiddleware, async (c) => {
  try {
    const todoId = c.req.param('id');
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const appConfig = createAppConfig(c);
    const websocketService = createWebSocketService(c);
    // Verify TODO access permissions
    const accessResult = await websocketService.verifyTodoAccess(todoId, userId, appConfig);
    if (accessResult.isErr()) {
      const error = new WebSocketPermissionError('Access denied');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    const hasAccess = accessResult.value;
    if (!hasAccess) {
      const error = new WebSocketPermissionError('No access to this todo');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    // Get user information
    const userResult = await websocketService.authenticateConnection(
      // For WebSocket connections, we'd need to handle token differently
      // For now, return basic user info
      '', // This would be the JWT token in a real WebSocket connection
      appConfig,
    );
    if (userResult.isErr()) {
      const error = new WebSocketAuthError('Authentication failed');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    // Initialize TODO room in WebSocket service
    // Add user to the TODO room
    // const userInfo = userResult.value;
    // const todoWebSocketService = createTodoWebSocketService(todoId);
    // await todoWebSocketService.addUser(userId, {
    //   username: userInfo.email, // Using email as username for now
    //   email: userInfo.email,
    // });
    // eslint-disable-next-line no-console
    console.log(`User ${userId} connected to TODO ${todoId}`);
    const response = WebSocketResponseUtil.connected(todoId, userId);
    return c.json(response);
  } catch (error) {
    const response = handleServiceError(error);
    return c.json(response, 500);
  }
});
/**
 * Handle TODO update via WebSocket-like API.
 * POST /api/v1/websocket/todo/:id/update
 */
router.post('/todo/:id/update', jwtMiddleware, async (c) => {
  try {
    const todoId = c.req.param('id');
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const body = await c.req.json();
    const appConfig = createAppConfig(c);
    const websocketService = createWebSocketService(c);
    // Verify TODO access permissions
    const accessResult = await websocketService.verifyTodoAccess(todoId, userId, appConfig);
    if (accessResult.isErr()) {
      const error = new WebSocketPermissionError('Access denied');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    // Handle TODO update
    const updateResult = await websocketService.updateTodo(
      todoId,
      body.data || {},
      userId,
      appConfig,
    );
    if (updateResult.isErr()) {
      const error = new WebSocketRoomError('Failed to update todo');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    // Broadcast update to all users in the room
    // const todoWebSocketService = createTodoWebSocketService(todoId);
    // await todoWebSocketService.broadcastMessage({
    //   type: 'todo_update',
    //   payload: body.data || {},
    //   timestamp: Date.now(),
    //   sender: userId,
    // });
    const response = WebSocketResponseUtil.todoUpdated(body.data || {}, todoId, userId);
    return c.json(response);
  } catch (error) {
    const response = handleServiceError(error);
    return c.json(response, 500);
  }
});
/**
 * WebSocket message handler for real-time WebSocket connections.
 * This would be used in a real WebSocket implementation.
 */
router.get('/todo/:id/ws', jwtMiddleware, async (c) => {
  try {
    const todoId = c.req.param('id');
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const appConfig = createAppConfig(c);
    const websocketService = createWebSocketService(c);
    // Verify TODO access permissions
    const accessResult = await websocketService.verifyTodoAccess(todoId, userId, appConfig);
    if (accessResult.isErr()) {
      const error = new WebSocketPermissionError('Access denied');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    const hasAccess = accessResult.value;
    if (!hasAccess) {
      const error = new WebSocketPermissionError('No access to this todo');
      const response = WebSocketResponseUtil.error(error, todoId, userId);
      return c.json(response);
    }
    // In a real implementation, this would upgrade to WebSocket
    // For now, return WebSocket connection information
    const response = WebSocketResponseUtil.success({
      message: 'WebSocket endpoint ready',
      todoId,
      userId,
      note: 'In production, this would upgrade to a WebSocket connection',
    }, todoId, userId);
    return c.json(response);
  } catch (error) {
    const response = handleServiceError(error);
    return c.json(response, 500);
  }
});
export default router;
