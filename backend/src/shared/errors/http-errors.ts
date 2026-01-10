// shared/errors/http-errors.ts
import {BaseError} from './base-error';

/**
 * HTTP 200 OK - Success response
 */
export class OkResponse<T = unknown> {
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
 * HTTP 400 Bad Request
 */
export class BadRequestError extends BaseError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(message, 'BAD_REQUEST', 400, details);
  }
}

/**
 * HTTP 401 Unauthorized
 */
export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}

/**
 * HTTP 403 Forbidden
 */
export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 'FORBIDDEN', 403, details);
  }
}

/**
 * HTTP 404 Not Found
 */
export class NotFoundError extends BaseError {
  constructor(message = 'Not Found', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * HTTP 409 Conflict
 */
export class ConflictError extends BaseError {
  constructor(message = 'Conflict', details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}

/**
 * HTTP 422 Unprocessable Entity
 */
export class ValidationError extends BaseError {
  constructor(message = 'Validation Failed', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422, details);
  }
}

/**
 * HTTP 429 Too Many Requests
 */
export class RateLimitError extends BaseError {
  constructor(message = 'Too Many Requests', details?: unknown) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
  }
}

/**
 * HTTP 500 Internal Server Error
 */
export class InternalServerError extends BaseError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
  }
}

// Export HTTP error collection
export const HttpErrors = {
  OkResponse,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
};
