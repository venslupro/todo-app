// backend/src/errors/http-errors.ts
import {BaseError} from './base-error';

/**
 * HTTP 400 Bad Request 错误
 */
export class BadRequestError extends BaseError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(message, 'BAD_REQUEST', 400, details);
  }
}

/**
 * HTTP 401 Unauthorized 错误
 */
export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}

/**
 * HTTP 403 Forbidden 错误
 */
export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 'FORBIDDEN', 403, details);
  }
}

/**
 * HTTP 404 Not Found 错误
 */
export class NotFoundError extends BaseError {
  constructor(message = 'Not Found', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * HTTP 409 Conflict 错误
 */
export class ConflictError extends BaseError {
  constructor(message = 'Conflict', details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}

/**
 * HTTP 422 Unprocessable Entity 错误
 */
export class ValidationError extends BaseError {
  constructor(message = 'Validation Failed', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422, details);
  }
}

/**
 * HTTP 429 Too Many Requests 错误
 */
export class RateLimitError extends BaseError {
  constructor(message = 'Too Many Requests', details?: unknown) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
  }
}

/**
 * HTTP 500 Internal Server Error 错误
 */
export class InternalServerError extends BaseError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
  }
}

/**
 * HTTP 503 Service Unavailable 错误
 */
export class ServiceUnavailableError extends BaseError {
  constructor(message = 'Service Unavailable', details?: unknown) {
    super(message, 'SERVICE_UNAVAILABLE', 503, details);
  }
}

// 导出所有HTTP错误
export const HttpErrors = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
};