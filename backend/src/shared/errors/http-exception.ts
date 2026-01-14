import {HTTPException} from 'hono/http-exception';

/**
 * HTTP 200 OK - Success response wrapper.
 */
export class SuccessResponse<T = unknown> {
  public readonly statusCode: number = 200;
  public readonly code: string = 'OK';
  public readonly data: T | undefined;
  public readonly message: string;

  constructor(data?: T, message = 'Success') {
    this.data = data;
    this.message = message;
  }

  public toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

/**
 * HTTP 400 Bad Request error based on Hono HTTPException.
 */
export class BadRequestException extends HTTPException {
  constructor(message = 'Bad Request', cause?: unknown) {
    super(400, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * HTTP 401 Unauthorized error based on Hono HTTPException.
 */
export class UnauthorizedException extends HTTPException {
  constructor(message = 'Unauthorized', cause?: unknown) {
    super(401, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * HTTP 403 Forbidden error based on Hono HTTPException.
 */
export class ForbiddenException extends HTTPException {
  constructor(message = 'Forbidden', cause?: unknown) {
    super(403, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * HTTP 404 Not Found error based on Hono HTTPException.
 */
export class NotFoundException extends HTTPException {
  constructor(message = 'Not Found', cause?: unknown) {
    super(404, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * HTTP 409 Conflict error based on Hono HTTPException.
 */
export class ConflictException extends HTTPException {
  constructor(message = 'Conflict', cause?: unknown) {
    super(409, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * HTTP 422 Unprocessable Entity error based on Hono HTTPException.
 */
export class ValidationException extends HTTPException {
  constructor(message = 'Validation Failed', cause?: unknown) {
    super(422, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * HTTP 429 Too Many Requests error based on Hono HTTPException.
 */
export class RateLimitException extends HTTPException {
  constructor(message = 'Too Many Requests', cause?: unknown) {
    super(429, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * HTTP 500 Internal Server Error based on Hono HTTPException.
 */
export class InternalServerException extends HTTPException {
  constructor(message = 'Internal Server Error', cause?: unknown) {
    super(500, {message});
    if (cause) {
      (this as any).cause = cause;
    }
  }
}

/**
 * Collection of HTTP exception classes for easy access.
 */
export const HttpExceptions = {
  SuccessResponse,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ValidationException,
  RateLimitException,
  InternalServerException,
};
