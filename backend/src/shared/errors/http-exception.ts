import {HTTPException} from 'hono/http-exception';

/**
 * Filters out null, undefined, and empty string values from an object.
 * @param obj - The object to filter
 * @returns A new object with empty values removed
 */
function filterEmptyValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const filtered: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      filtered[key as keyof T] = value as T[keyof T];
    }
  }
  return filtered;
}

const enum StatusCode {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
}

const enum MessageType {
  Success = 'Success',
  BadRequest = 'Bad Request',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  NotFound = 'Not Found',
  Conflict = 'Conflict',
  ValidationFailed = 'Validation Failed',
  TooManyRequests = 'Too Many Requests',
  InternalServerError = 'Internal Server Error',
}

/**
 * HTTP 200 OK - Success response wrapper.
 */
export class SuccessResponse extends HTTPException {
  private responseData?: unknown;

  constructor(data?: unknown) {
    super(StatusCode.OK, {message: MessageType.Success});
    if (data) {
      this.responseData = data;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.OK,
      message: this.message,
      data: this.responseData,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.OK,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 400 Bad Request error based on Hono HTTPException.
 */
export class BadRequestException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.BadRequest, {message: MessageType.BadRequest});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.BadRequest,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.BadRequest,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 401 Unauthorized error based on Hono HTTPException.
 */
export class UnauthorizedException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.Unauthorized, {message: MessageType.Unauthorized});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.Unauthorized,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.Unauthorized,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 403 Forbidden error based on Hono HTTPException.
 */
export class ForbiddenException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.Forbidden, {message: MessageType.Forbidden});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.Forbidden,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.Forbidden,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 404 Not Found error based on Hono HTTPException.
 */
export class NotFoundException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.NotFound, {message: MessageType.NotFound});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.NotFound,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.NotFound,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 409 Conflict error based on Hono HTTPException.
 */
export class ConflictException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.Conflict, {message: MessageType.Conflict});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.Conflict,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.Conflict,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 422 Unprocessable Entity error based on Hono HTTPException.
 */
export class ValidationException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.UnprocessableEntity, {message: MessageType.ValidationFailed});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.UnprocessableEntity,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.UnprocessableEntity,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 429 Too Many Requests error based on Hono HTTPException.
 */
export class RateLimitException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.TooManyRequests, {message: MessageType.TooManyRequests});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.TooManyRequests,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.TooManyRequests,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/**
 * HTTP 500 Internal Server Error based on Hono HTTPException.
 */
export class InternalServerException extends HTTPException {
  private errorCause?: unknown;

  constructor(cause?: unknown) {
    super(StatusCode.InternalServerError, {message: MessageType.InternalServerError});
    if (cause) {
      this.errorCause = cause;
    }
  }

  getResponse(): Response {
    const responseBody = filterEmptyValues({
      code: StatusCode.InternalServerError,
      message: this.message,
      details: this.errorCause,
    });
    return new Response(JSON.stringify(responseBody), {
      status: StatusCode.InternalServerError,
      headers: {'Content-Type': 'application/json'},
    });
  }
}
