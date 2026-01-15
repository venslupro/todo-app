// core/durable-objects/todo-websocket.ts
// Durable Object implementation for WebSocket connections
// Note: This is temporarily simplified due to type compatibility issues

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

/**
 * Simplified WebSocket service for TODO rooms
 * This is a temporary implementation until Durable Objects type issues are resolved
 */
export class TodoWebSocketService {
  private room: TodoRoom | null = null;

  constructor(todoId: string) {
    this.room = {
      todoId,
      connections: new Map(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
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
    }
  }

  /**
   * Gets all users in the TODO room.
   */
  getUsers(): WebSocketConnection[] {
    if (!this.room) {
      return [];
    }

    return Array.from(this.room.connections.values());
  }

  /**
   * Gets user count in the TODO room.
   */
  getUserCount(): number {
    if (!this.room) {
      return 0;
    }

    return this.room.connections.size;
  }

  /**
   * Checks if a user is in the TODO room.
   */
  hasUser(userId: string): boolean {
    if (!this.room) {
      return false;
    }

    return this.room.connections.has(userId);
  }

  /**
   * Gets room information.
   */
  getRoomInfo(): TodoRoom | null {
    return this.room;
  }

  /**
   * Cleans up inactive users.
   */
  async cleanupInactiveUsers(maxInactiveTime: number = 30 * 60 * 1000): Promise<void> {
    if (!this.room) {
      return;
    }

    const now = Date.now();
    for (const [userId, connection] of this.room.connections.entries()) {
      if (now - connection.lastActivity > maxInactiveTime) {
        this.room.connections.delete(userId);
      }
    }
    this.room.updatedAt = now;
  }

  /**
   * Broadcasts a message to all users in the room.
   */
  async broadcastMessage(message: WebSocketMessage): Promise<void> {
    if (!this.room) {
      return;
    }

    // In a real implementation, this would send the message to all connected WebSockets
    console.log(`Broadcasting message to ${this.room.connections.size} users:`, message);
  }

  /**
   * Sends a message to a specific user.
   */
  async sendMessageToUser(userId: string, message: WebSocketMessage): Promise<void> {
    if (!this.room || !this.room.connections.has(userId)) {
      return;
    }

    // In a real implementation, this would send the message to the specific user's WebSocket
    console.log(`Sending message to user ${userId}:`, message);
  }

  /**
   * Destroys the room and cleans up resources.
   */
  async destroy(): Promise<void> {
    this.room = null;
  }
}