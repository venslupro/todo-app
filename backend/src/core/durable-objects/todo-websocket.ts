// core/durable-objects/todo-websocket.ts
/* eslint-disable no-undef */
import {WebSocketService} from '../services/websocket-service';
import {AppConfig} from '../../shared/config/config';
import {Todo} from '../models/todo';

interface WebSocketConnection {
  webSocket: WebSocket;
  userId: string;
  todoId: string;
  createdAt: number;
}

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  sender: string;
}

export interface Env {
  supabase_url: string;
  supabase_service_role_key: string;
  supabase_anon_key: string;
  environment: 'development' | 'production' | 'staging';
  TODO_WEBSOCKET: DurableObjectNamespace;
}

export class TodoWebSocketDurableObject {
  private connections: Map<string, WebSocketConnection> = new Map();
  private websocketService: WebSocketService;

  constructor(private env: Env) {
    this.websocketService = new WebSocketService();
  }

  /**
   * Handle WebSocket connection request
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/websocket') {
      // Upgrade to WebSocket connection
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', {status: 426});
      }

      const {0: clientWebSocket, 1: serverWebSocket} = new WebSocketPair();

      try {
        // Validate authentication information
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new Error('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7);

        // Get todoId from URL parameters
        const todoId = url.searchParams.get('todoId');
        if (!todoId) {
          throw new Error('Todo ID is required');
        }

        // Validate user identity and permissions
        const appConfig = new AppConfig({
          supabase_url: this.env.supabase_url,
          supabase_anon_key: this.env.supabase_anon_key,
          supabase_service_role_key: this.env.supabase_service_role_key,
          environment: this.env.environment,
        });
        const user = await this.websocketService.authenticateConnection(
          token, appConfig,
        );
        const hasAccess = await this.websocketService.verifyTodoAccess(
          todoId, user.id, appConfig,
        );

        if (!hasAccess) {
          throw new Error('No access to this todo');
        }

        // Accept WebSocket connection
        serverWebSocket.accept();

        // Store connection information
        const connectionId = this.generateConnectionId();
        const connection: WebSocketConnection = {
          webSocket: serverWebSocket,
          userId: user.id,
          todoId,
          createdAt: Date.now(),
        };

        this.connections.set(connectionId, connection);

        // Set up message handling
        serverWebSocket.addEventListener('message', (event) => {
          this.handleWebSocketMessage(connectionId, event.data);
        });

        serverWebSocket.addEventListener('close', () => {
          this.connections.delete(connectionId);
        });

        // Send connection success message
        serverWebSocket.send(JSON.stringify({
          type: 'connection_established',
          payload: {
            connectionId,
            todoId,
            userId: user.id,
          },
          timestamp: Date.now(),
        }));

        return new Response(null, {
          status: 101,
          webSocket: clientWebSocket,
        });
      } catch (error) {
        // Send error message and close connection
        if (error instanceof Error) {
          clientWebSocket.send(JSON.stringify({
            type: 'error',
            payload: {
              message: error.message,
            },
            timestamp: Date.now(),
          }));
        }
        clientWebSocket.close(1008, 'Authentication failed');
        return new Response('Authentication failed', {status: 401});
      }
    }

    return new Response('Not found', {status: 404});
  }

  /**
   * Handle WebSocket message
   */
  private async handleWebSocketMessage(connectionId: string, data: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    try {
      const message: WebSocketMessage = JSON.parse(data);

      switch (message.type) {
      case 'todo_update':
        await this.handleTodoUpdate(connection.todoId, message.payload, connection.userId);
        break;
      case 'ping':
        connection.webSocket.send(JSON.stringify({
          type: 'pong',
          payload: {timestamp: Date.now()},
          timestamp: Date.now(),
        }));
        break;
      default:
        connection.webSocket.send(JSON.stringify({
          type: 'error',
          payload: {message: 'Unknown message type'},
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      connection.webSocket.send(JSON.stringify({
        type: 'error',
        payload: {message: 'Invalid message format'},
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * Handle TODO update message
   */
  private async handleTodoUpdate(
    todoId: string, updateData: unknown, userId: string,
  ): Promise<void> {
    try {
      // Create AppConfig instance
      const appConfig = new AppConfig({
        supabase_url: this.env.supabase_url,
        supabase_anon_key: this.env.supabase_anon_key,
        supabase_service_role_key: this.env.supabase_service_role_key,
        environment: this.env.environment,
      });

      // Call WebSocketService to handle business logic
      await this.websocketService.handleTodoUpdate(
        todoId, updateData as Partial<Todo>, userId, appConfig,
      );

      // Broadcast update message to all users in the room
      await this.broadcastToTodoRoom(todoId, {
        type: 'todo_updated',
        payload: updateData,
        timestamp: Date.now(),
        sender: userId,
      }, userId);
    } catch (error) {
      // Error handling - console statements removed
    }
  }

  /**
   * Broadcast message to all users in TODO room
   */
  private async broadcastToTodoRoom(
    todoId: string, message: WebSocketMessage, excludeUserId?: string,
  ): Promise<void> {
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.todoId === todoId && connection.userId !== excludeUserId) {
        try {
          connection.webSocket.send(JSON.stringify(message));
        } catch (error) {
          // Error handling - console statements removed
          this.connections.delete(connectionId);
        }
      }
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
