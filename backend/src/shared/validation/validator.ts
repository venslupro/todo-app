// shared/validation/validator.ts
import {ErrorCode, Result, okResult, errResult} from '../errors/error-codes';
import {
  TodoStatus,
  TodoPriority,
} from '../../core/models/todo';
import {
  MediaType,
  MimeTypes,
} from '../../core/models/media';
import {
  SharePermission,
} from '../../core/models/share';

/**
 * Validation utility class
 */
export class Validator {
  /**
   * Validate UUID format
   */
  static validateUUID(id: string): Result<void, ErrorCode> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(undefined);
  }

  /**
   * Validate TODO status
   */
  static validateTodoStatus(status: string): Result<TodoStatus, ErrorCode> {
    if (!Object.values(TodoStatus).includes(status as TodoStatus)) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(status as TodoStatus);
  }

  /**
   * Validate TODO priority
   */
  static validateTodoPriority(priority: string): Result<TodoPriority, ErrorCode> {
    if (!Object.values(TodoPriority).includes(priority as TodoPriority)) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(priority as TodoPriority);
  }

  /**
   * Validate share permissions
   */
  static validateSharePermission(permission: string): Result<SharePermission, ErrorCode> {
    if (!Object.values(SharePermission).includes(permission as SharePermission)) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(permission as SharePermission);
  }

  /**
   * Validate date format
   */
  static validateDate(dateString: string): Result<Date, ErrorCode> {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(date);
  }

  /**
   * Validate file size
   */
  static validateFileSize(fileSize: number, maxSizeBytes: number): Result<void, ErrorCode> {
    if (fileSize > maxSizeBytes) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(undefined);
  }

  /**
   * Validate media file type
   */
  static validateMediaType(mimeType: string, mediaType: MediaType): Result<void, ErrorCode> {
    const supportedTypes = MimeTypes[mediaType];

    if (!supportedTypes.includes(mimeType.toLowerCase())) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(undefined);
  }

  /**
   * Validate video duration
   */
  static validateVideoDuration(durationSeconds: number): Result<void, ErrorCode> {
    const MAX_VIDEO_DURATION = 4 * 60; // 4 minutes
    if (durationSeconds > MAX_VIDEO_DURATION) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return okResult(undefined);
  }

  /**
   * Sanitize and validate input string
   */
  static sanitizeString(input: string, maxLength: number): Result<string, ErrorCode> {
    if (!input || typeof input !== 'string') {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }

    const sanitized = input.trim();
    if (sanitized.length === 0) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }

    if (sanitized.length > maxLength) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }

    return okResult(sanitized);
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(limit?: number, offset?: number): Result<{
    limit: number;
    offset: number;
  }, ErrorCode> {
    const DEFAULT_LIMIT = 50;
    const MAX_LIMIT = 1000;

    const validatedLimit = limit ?
      Math.max(1, Math.min(Math.floor(limit), MAX_LIMIT)) :
      DEFAULT_LIMIT;

    const validatedOffset = offset ?
      Math.max(0, Math.floor(offset)) :
      0;

    return okResult({
      limit: validatedLimit,
      offset: validatedOffset,
    });
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): Result<string, ErrorCode> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedResult = this.sanitizeString(email, 255);

    if (sanitizedResult.isErr()) {
      return sanitizedResult;
    }

    const sanitized = sanitizedResult.value;

    if (!emailRegex.test(sanitized)) {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    // Additional email validation rules
    if (sanitized.length > 254) {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    const [localPart, domain] = sanitized.split('@');

    // Ensure both parts exist after split
    if (!localPart || !domain) {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    if (localPart.length > 64) {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    if (domain.length > 253) {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    // Check for common invalid patterns
    if (domain.includes('..')) {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    return okResult(sanitized);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): Result<void, ErrorCode> {
    if (password.length < 8) {
      return errResult(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    if (!/[A-Z]/.test(password)) {
      return errResult(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    if (!/[a-z]/.test(password)) {
      return errResult(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    if (!/\d/.test(password)) {
      return errResult(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    return okResult(undefined);
  }
}
