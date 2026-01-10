// backend/src/errors/websocket-errors.ts
import {BaseError} from './base-error';

/**
 * WebSocket连接关闭错误码
 * 参考：https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
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
 * WebSocket特定错误
 */
export class WebSocketError extends BaseError {
  public readonly closeCode: number;

  constructor(
    message: string,
    code: string,
    closeCode: number = WebSocketCloseCode.INTERNAL_ERROR,
    details?: unknown,
  ) {
    super(message, code, 0, details); // WebSocket错误没有HTTP状态码
    this.closeCode = closeCode;
  }
}

/**
 * 认证失败错误
 */
export class WebSocketAuthError extends WebSocketError {
  constructor(message = 'Authentication failed', details?: unknown) {
    super(message, 'WS_AUTH_ERROR', WebSocketCloseCode.POLICY_VIOLATION, details);
  }
}

/**
 * 无效消息格式错误
 */
export class WebSocketMessageError extends WebSocketError {
  constructor(message = 'Invalid message format', details?: unknown) {
    super(message, 'WS_MESSAGE_ERROR', WebSocketCloseCode.UNSUPPORTED_DATA, details);
  }
}

/**
 * 房间不存在错误
 */
export class WebSocketRoomError extends WebSocketError {
  constructor(message = 'Room not found', details?: unknown) {
    super(message, 'WS_ROOM_ERROR', WebSocketCloseCode.POLICY_VIOLATION, details);
  }
}

/**
 * 权限不足错误
 */
export class WebSocketPermissionError extends WebSocketError {
  constructor(message = 'Insufficient permissions', details?: unknown) {
    super(message, 'WS_PERMISSION_ERROR', WebSocketCloseCode.POLICY_VIOLATION, details);
  }
}

// 导出所有WebSocket错误
export const WebSocketErrors = {
  WebSocketError,
  WebSocketAuthError,
  WebSocketMessageError,
  WebSocketRoomError,
  WebSocketPermissionError,
  WebSocketCloseCode,
};