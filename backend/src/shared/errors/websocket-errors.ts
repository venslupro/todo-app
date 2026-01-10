// shared/errors/websocket-errors.ts
import {BaseError} from './base-error';

/**
 * WebSocket连接关闭错误码
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
 * WebSocket认证错误
 */
export class WebSocketAuthError extends BaseError {
  constructor(message = 'Authentication failed', details?: unknown) {
    super(message, 'WS_AUTH_ERROR', 0, details);
    this.closeCode = WebSocketCloseCode.POLICY_VIOLATION;
  }

  public readonly closeCode: number;
}

/**
 * WebSocket消息格式错误
 */
export class WebSocketMessageError extends BaseError {
  constructor(message = 'Invalid message format', details?: unknown) {
    super(message, 'WS_MESSAGE_ERROR', 0, details);
    this.closeCode = WebSocketCloseCode.UNSUPPORTED_DATA;
  }

  public readonly closeCode: number;
}

// 导出WebSocket错误集合
export const WebSocketErrors = {
  WebSocketAuthError,
  WebSocketMessageError,
  WebSocketCloseCode,
};
