// shared/validation/validator.ts
import {ErrorCode, Result, Ok, Err} from '../errors/error-codes';
import {
  TodoStatus,
  TodoPriority,
} from '../../core/models/todo';
import {
  MediaType,
  SUPPORTED_MIME_TYPES,
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
  static validateUUID(id: string, _fieldName = 'id'): Result<void, ErrorCode> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(undefined);
  }

  /**
   * Validate TODO status
   */
  static validateTodoStatus(status: string): Result<TodoStatus, ErrorCode> {
    if (!Object.values(TodoStatus).includes(status as TodoStatus)) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(status as TodoStatus);
  }

  /**
   * Validate TODO priority
   */
  static validateTodoPriority(priority: string): Result<TodoPriority, ErrorCode> {
    if (!Object.values(TodoPriority).includes(priority as TodoPriority)) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(priority as TodoPriority);
  }

  /**
   * Validate share permissions
   */
  static validateSharePermission(permission: string): Result<SharePermission, ErrorCode> {
    if (!Object.values(SharePermission).includes(permission as SharePermission)) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(permission as SharePermission);
  }

  /**
   * Validate date format
   */
  static validateDate(dateString: string, _fieldName = 'date'): Result<Date, ErrorCode> {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(date);
  }

  /**
   * Validate file size
   */
  static validateFileSize(fileSize: number, maxSizeBytes: number): Result<void, ErrorCode> {
    if (fileSize > maxSizeBytes) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(undefined);
  }

  /**
   * Validate media file type
   */
  static validateMediaType(mimeType: string, mediaType: MediaType): Result<void, ErrorCode> {
    const supportedTypes = SUPPORTED_MIME_TYPES[mediaType];

    if (!supportedTypes.includes(mimeType.toLowerCase())) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(undefined);
  }

  /**
   * Validate video duration
   */
  static validateVideoDuration(durationSeconds: number): Result<void, ErrorCode> {
    const MAX_VIDEO_DURATION = 4 * 60; // 4 minutes
    if (durationSeconds > MAX_VIDEO_DURATION) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }
    return Ok(undefined);
  }

  /**
   * Sanitize and validate input string
   */
  static sanitizeString(input: string, maxLength: number): Result<string, ErrorCode> {
    if (!input || typeof input !== 'string') {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }

    const sanitized = input.trim();
    if (sanitized.length === 0) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }

    if (sanitized.length > maxLength) {
      return Err(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }

    return Ok(sanitized);
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

    return Ok({
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
      return Err(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    // Additional email validation rules
    if (sanitized.length > 254) {
      return Err(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    const [localPart, domain] = sanitized.split('@');

    // Ensure both parts exist after split
    if (!localPart || !domain) {
      return Err(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    if (localPart.length > 64) {
      return Err(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    if (domain.length > 253) {
      return Err(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    // Check for common invalid patterns
    if (domain.includes('..')) {
      return Err(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return Err(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    return Ok(sanitized);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): Result<void, ErrorCode> {
    if (password.length < 8) {
      return Err(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    if (!/[A-Z]/.test(password)) {
      return Err(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    if (!/[a-z]/.test(password)) {
      return Err(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    if (!/\d/.test(password)) {
      return Err(ErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    return Ok(undefined);
  }
}
