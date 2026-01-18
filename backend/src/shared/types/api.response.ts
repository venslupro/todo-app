import { StatusCode } from 'hono/utils/http-status';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  details?: unknown;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  details?: unknown;
}

export class ApiResponseBuilder {
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
    };
  }

  static created<T>(data: T, message: string = 'Created'): ApiResponse<T> {
    return {
      code: 201,
      message,
      data,
    };
  }

  static noContent(message: string = 'No Content'): ApiResponse {
    return {
      code: 204,
      message,
    };
  }

  static error(code: StatusCode, message: string, details?: unknown): ApiErrorResponse {
    return {
      code,
      message,
      details,
    };
  }

  static fromException(exception: AppException): ApiErrorResponse {
    return {
      code: exception.code,
      message: exception.message,
      details: exception.details,
    };
  }
}

import { AppException } from '../exceptions/app.exception';
