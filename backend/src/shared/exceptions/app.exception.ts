import { StatusCode } from 'hono/utils/http-status';

export class AppException extends Error {
  public readonly code: StatusCode;
  public readonly details?: unknown;

  constructor(code: StatusCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppException';
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): AppException {
    return new AppException(400, message, details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: unknown): AppException {
    return new AppException(401, message, details);
  }

  static forbidden(message: string = 'Forbidden', details?: unknown): AppException {
    return new AppException(403, message, details);
  }

  static notFound(message: string = 'Not Found', details?: unknown): AppException {
    return new AppException(404, message, details);
  }

  static conflict(message: string = 'Conflict', details?: unknown): AppException {
    return new AppException(409, message, details);
  }

  static unprocessableEntity(message: string = 'Validation Failed', details?: unknown): AppException {
    return new AppException(422, message, details);
  }

  static internalError(message: string = 'Internal Server Error', details?: unknown): AppException {
    return new AppException(500, message, details);
  }

  static serviceUnavailable(message: string = 'Service Unavailable', details?: unknown): AppException {
    return new AppException(503, message, details);
  }
}
