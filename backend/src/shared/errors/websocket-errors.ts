/**
 * WebSocket connection close codes.
 */
export enum WebSocketCloseCode {
  NORMAL_CLOSURE = 1000,
  GOING_AWAY = 1001,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED_DATA = 1003,
  NO_STATUS_RECEIVED = 1005,
  ABNORMAL_CLOSURE = 1006,
  INVALID_FRAME_PAYLOAD_DATA = 1007,
  POLICY_VIOLATION = 1008,
  MESSAGE_TOO_BIG = 1009,
  MISSING_EXTENSION = 1010,
  INTERNAL_ERROR = 1011,
  SERVICE_RESTART = 1012,
  TRY_AGAIN_LATER = 1013,
  BAD_GATEWAY = 1014,
  TLS_HANDSHAKE_FAILED = 1015,
}

/**
 * WebSocket response types.
 */
export enum WebSocketResponseType {
  SUCCESS = 'success',
  ERROR = 'error',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ROOM_USERS = 'room_users',
  ROOM_STATS = 'room_stats',
  TODO_UPDATED = 'todo_updated',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  PING = 'ping',
  PONG = 'pong',
}

/**
 * Base WebSocket error class.
 */
export abstract class WebSocketBaseError extends Error {
  public readonly closeCode: number;
  public readonly code: string;
  public readonly type: WebSocketResponseType = WebSocketResponseType.ERROR;

  constructor(
    message: string,
    code: string,
    closeCode: number = WebSocketCloseCode.INTERNAL_ERROR,
  ) {
    super(message);
    this.code = code;
    this.closeCode = closeCode;
  }

  /**
   * Converts error to WebSocket response format.
   */
  toResponse(): WebSocketResponse {
    return {
      type: this.type,
      error: {
        code: this.code,
        message: this.message,
        closeCode: this.closeCode,
      },
      timestamp: Date.now(),
    };
  }
}

/**
 * WebSocket authentication error.
 */
export class WebSocketAuthError extends WebSocketBaseError {
  constructor(message = 'Authentication failed') {
    super(message, 'WS_AUTH_ERROR', WebSocketCloseCode.POLICY_VIOLATION);
    this.name = 'WebSocketAuthError';
  }
}

/**
 * WebSocket message format error.
 */
export class WebSocketMessageError extends WebSocketBaseError {
  constructor(message = 'Invalid message format') {
    super(message, 'WS_MESSAGE_ERROR', WebSocketCloseCode.UNSUPPORTED_DATA);
    this.name = 'WebSocketMessageError';
  }
}

/**
 * WebSocket connection error.
 */
export class WebSocketConnectionError extends WebSocketBaseError {
  constructor(message = 'Connection error') {
    super(message, 'WS_CONNECTION_ERROR', WebSocketCloseCode.INTERNAL_ERROR);
    this.name = 'WebSocketConnectionError';
  }
}

/**
 * WebSocket permission error.
 */
export class WebSocketPermissionError extends WebSocketBaseError {
  constructor(message = 'Permission denied') {
    super(message, 'WS_PERMISSION_ERROR', WebSocketCloseCode.POLICY_VIOLATION);
    this.name = 'WebSocketPermissionError';
  }
}

/**
 * WebSocket room error.
 */
export class WebSocketRoomError extends WebSocketBaseError {
  constructor(message = 'Room error') {
    super(message, 'WS_ROOM_ERROR', WebSocketCloseCode.INTERNAL_ERROR);
    this.name = 'WebSocketRoomError';
  }
}

/**
 * WebSocket validation error.
 */
export class WebSocketValidationError extends WebSocketBaseError {
  constructor(message = 'Validation failed') {
    super(message, 'WS_VALIDATION_ERROR', WebSocketCloseCode.UNSUPPORTED_DATA);
    this.name = 'WebSocketValidationError';
  }
}

/**
 * WebSocket response interface.
 */
export interface WebSocketResponse {
  type: WebSocketResponseType;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    closeCode?: number;
    details?: unknown;
  };
  timestamp: number;
  todoId?: string | undefined;
  userId?: string | undefined;
}

/**
 * WebSocket response utility class.
 */
export class WebSocketResponseUtil {
  /**
   * Creates a success response.
   */
  static success(data?: unknown, todoId?: string, userId?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.SUCCESS,
      data,
      timestamp: Date.now(),
      todoId,
      userId,
    };
  }

  /**
   * Creates an error response.
   */
  static error(error: WebSocketBaseError, todoId?: string, userId?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.ERROR,
      error: {
        code: error.code,
        message: error.message,
        closeCode: error.closeCode,
      },
      timestamp: Date.now(),
      todoId,
      userId,
    };
  }

  /**
   * Creates a connection response.
   */
  static connected(todoId?: string, userId?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.CONNECTED,
      data: {
        message: 'WebSocket connection established',
        todoId,
        userId,
      },
      timestamp: Date.now(),
      todoId,
      userId,
    };
  }

  /**
   * Creates a room users response.
   */
  static roomUsers(users: unknown[], todoId?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.ROOM_USERS,
      data: {
        users,
      },
      timestamp: Date.now(),
      todoId,
    };
  }

  /**
   * Creates a room stats response.
   */
  static roomStats(stats: unknown, todoId?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.ROOM_STATS,
      data: {
        stats,
      },
      timestamp: Date.now(),
      todoId,
    };
  }

  /**
   * Creates a todo updated response.
   */
  static todoUpdated(data: unknown, todoId?: string, updatedBy?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.TODO_UPDATED,
      data,
      timestamp: Date.now(),
      todoId,
      userId: updatedBy,
    };
  }

  /**
   * Creates a user joined response.
   */
  static userJoined(userInfo: unknown, todoId?: string, userId?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.USER_JOINED,
      data: {
        user: userInfo,
      },
      timestamp: Date.now(),
      todoId,
      userId,
    };
  }

  /**
   * Creates a user left response.
   */
  static userLeft(userId: string, todoId?: string): WebSocketResponse {
    return {
      type: WebSocketResponseType.USER_LEFT,
      data: {
        userId,
      },
      timestamp: Date.now(),
      todoId,
      userId,
    };
  }

  /**
   * Creates a ping response.
   */
  static ping(): WebSocketResponse {
    return {
      type: WebSocketResponseType.PING,
      timestamp: Date.now(),
    };
  }

  /**
   * Creates a pong response.
   */
  static pong(): WebSocketResponse {
    return {
      type: WebSocketResponseType.PONG,
      timestamp: Date.now(),
    };
  }

  /**
   * Converts a WebSocket response to JSON string.
   */
  static toJson(response: WebSocketResponse): string {
    return JSON.stringify(response);
  }
}

/**
 * WebSocket error handler utility.
 */
export class WebSocketErrorHandler {
  /**
   * Handles WebSocket errors and returns appropriate response.
   */
  static handleError(error: unknown, todoId?: string, userId?: string): WebSocketResponse {
    if (error instanceof WebSocketBaseError) {
      return WebSocketResponseUtil.error(error, todoId, userId);
    }

    if (error instanceof Error) {
      const wsError = new WebSocketConnectionError(error.message);
      return WebSocketResponseUtil.error(wsError, todoId, userId);
    }

    const wsError = new WebSocketConnectionError('Unknown error occurred');
    return WebSocketResponseUtil.error(wsError, todoId, userId);
  }

  /**
   * Handles WebSocket connection errors.
   */
  static handleConnectionError(error: unknown, todoId?: string, userId?: string): {
    response: WebSocketResponse;
    closeCode: number;
  } {
    const response = this.handleError(error, todoId, userId);
    const closeCode = response.error?.closeCode || WebSocketCloseCode.INTERNAL_ERROR;
    
    return {
      response,
      closeCode,
    };
  }
}