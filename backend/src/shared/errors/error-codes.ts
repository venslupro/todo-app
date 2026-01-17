import {Result as NeverthrowResult, ok, err} from 'neverthrow';

/**
 * Global error codes enumeration.
 * These codes can be used by all modules except handlers.
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'auth invalid credentials',
  AUTH_TOKEN_INVALID = 'auth token invalid',
  AUTH_USER_NOT_FOUND = 'auth user not found',
  AUTH_EMAIL_EXISTS = 'auth email exists',

  // Validation errors
  VALIDATION_INVALID_EMAIL = 'validation invalid email',
  VALIDATION_INVALID_PASSWORD = 'validation invalid password',
  VALIDATION_REQUIRED_FIELD = 'validation required field',

  // Database errors
  DATABASE_QUERY_FAILED = 'database query failed',
  DATABASE_UNIQUE_CONSTRAINT = 'database unique constraint',

  // Business logic errors
  BUSINESS_RESOURCE_NOT_FOUND = 'business resource not found',
  BUSINESS_OPERATION_NOT_ALLOWED = 'business operation not allowed',

  // System errors
  SYSTEM_INTERNAL_ERROR = 'system internal error',
}

/**
 * Neverthrow result type for internal module communication.
 * Modules should return Result<T, ErrorCode> using ok() and err() functions.
 */
export type Result<T, E = ErrorCode> = NeverthrowResult<T, E>;

export const okResult = <T>(value: T) => ok(value);
export const errResult = <E = ErrorCode>(error: E) => err(error);

