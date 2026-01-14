// core/durable-objects/todo-websocket.ts
import {DurableObject} from 'cloudflare:workers';
interface WebSocketConnection {
  userId: string;
  username?: string | undefined;
  email?: string | undefined;
  connectedAt: number;
  lastActivity: number;
}
interface TodoRoom {
  todoId: string;
  connections: Map<string, WebSocketConnection>;
  createdAt: number;
  updatedAt: number;
}
interface WebSocketMessage {
  type: 'ping' | 'pong' | 'todo_update' | 'user_joined' | 'user_left' | 'error';
  payload?: unknown;
  timestamp: number;
  sender?: string;
}
export interface Env {
  supabase_url: string;
  supabase_service_role_key: string;
  supabase_anon_key: string;
  environment: 'development' | 'production' | 'staging';
  JWT_SECRET: string;
}
export class TodoWebSocketDurableObject extends DurableObject<Env> {
  private room: TodoRoom | null = null;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Initialize room state from storage
    ctx.blockConcurrencyWhile(async () => {
      const storedRoom = await ctx.storage.get<TodoRoom>('room');
      if (storedRoom) {
      this.room = {
        ...storedRoom,
        connections: new Map(storedRoom.connections),
       };
      }
    });
  }
  /**
   * Adds a user to the TODO room.
   */
  async addUser(userId: string, userInfo: {username?: string; email?: string}): Promise<void> {
    if (!this.room) {
      throw new Error('Room not initialized');
   }
    const connection: WebSocketConnection = {
      userId,
      username: userInfo.username,
      email: userInfo.email,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
   };
    this.room.connections.set(userId, connection);
    this.room.updatedAt = Date.now();
    await this.saveRoomState();
  }
  /**
   * Removes a user from the TODO room.
   */
  async removeUser(userId: string): Promise<void> {
    if (!this.room) {
      return;
   }
    this.room.connections.delete(userId);
    this.room.updatedAt = Date.now();
    await this.saveRoomState();
  }
  /**
   * Updates user activity timestamp.
   */
  async updateUserActivity(userId: string): Promise<void> {
    if (!this.room) {
      return;
   }
    const connection = this.room.connections.get(userId);
    if (connection) {
      connection.lastActivity = Date.now();
      this.room.updatedAt = Date.now();
      await this.saveRoomState();
   }
  }
  /**
   * Gets all users in the TODO room.
   */
  async getRoomUsers(): Promise<Array<WebSocketConnection & {isOnline: boolean}>> {
    if (!this.room) {
      return [];
   }
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000; // 5 minutes timeout
    return Array.from(this.room.connections.values()).map((conn) => ({
      ...conn,
      isOnline: conn.lastActivity > fiveMinutesAgo,
   }));
  }
  /**
   * Broadcasts a message to all users in the room.
   */
  async broadcastMessage(message: WebSocketMessage, ): Promise<void> {
    if (!this.room) {
      return;
   }
    // In a real implementation, this would send to all connected WebSockets
    // For now, we'll just log the broadcast
    console.log(`Broadcasting message to TODO ${this.room.todoId}:`, message);
    // Update room activity
    this.room.updatedAt = Date.now();
    await this.saveRoomState();
  }
  /**
   * Handles TODO update from a user.
   */
  async handleTodoUpdate(updateData: unknown, userId: string): Promise<void> {
    if (!this.room) {
      throw new Error('Room not initialized');
   }
    // Broadcast the update to all users
    await this.broadcastMessage({
      type: 'todo_update',
      payload: updateData,
      timestamp: Date.now(),
      sender: userId,
   });
    // Update user activity
    await this.updateUserActivity(userId);
  }
  /**
   * Initializes the TODO room.
   */
  async initializeRoom(todoId: string): Promise<void> {
    this.room = {
      todoId,
      connections: new Map(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
   };
    await this.saveRoomState();
  }
  /**
   * Gets room statistics.
   */
  async getRoomStats(): Promise<{
    todoId: string;
    totalUsers: number;
    onlineUsers: number;
    createdAt: number;
    updatedAt: number;
 }> {
    if (!this.room) {
      throw new Error('Room not initialized');
   }
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const onlineUsers = Array.from(this.room.connections.values()).filter(
      (conn) => conn.lastActivity > fiveMinutesAgo
    ).length;
    return {
      todoId: this.room.todoId,
      totalUsers: this.room.connections.size,
      onlineUsers,
      createdAt: this.room.createdAt,
      updatedAt: this.room.updatedAt,
   };
  }
  /**
   * Cleans up inactive connections.
   */
  async cleanupInactiveConnections(): Promise<void> {
    if (!this.room) {
      return;
   }
    const now = Date.now();
    const thirtyMinutesAgo = now - 30 * 60 * 1000; // 30 minutes timeout
    for (const [userId, connection] of this.room.connections.entries()) {
      if (connection.lastActivity < thirtyMinutesAgo) {
      this.room.connections.delete(userId);
      console.log(`Removed inactive user ${userId} from TODO ${this.room.todoId}`);
      }
    }
    this.room.updatedAt = now;
    await this.saveRoomState();
  }
  /**
   * Saves room state to storage.
   */
  private async saveRoomState(): Promise<void> {
    if (!this.room) {
      return;
   }
    // Convert Map to plain object for storage
    const roomForStorage = {
      ...this.room,
      connections: Object.fromEntries(this.room.connections),
   };
    await this.ctx.storage.put('room', roomForStorage);
  }
  /**
   * Handles HTTP requests for room management.
   */
  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      switch (path) {
        case '/users':
          if (request.method === 'GET') {
            const users = await this.getRoomUsers();
            return Response.json(users);
          }
          break;
        case '/stats':
          if (request.method === 'GET') {
            const stats = await this.getRoomStats();
            return Response.json(stats);
          }
          break;
        case '/cleanup':
          if (request.method === 'POST') {
            await this.cleanupInactiveConnections();
            return Response.json({success: true});
          }
          break;
        default:
          return new Response('Not found', {status: 404});
      }
      return new Response('Method not allowed', {status: 405});
    } catch (error) {
      console.error('Durable Object fetch error:', error);
      return Response.json({error: 'Internal server error'}, {status: 500});
    }
  }
}
