// shared/validation/validator.ts
import {HttpErrors} from '../errors/http-errors';
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
  static validateUUID(id: string, fieldName = 'id'): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new HttpErrors.ValidationError(`Invalid ${fieldName} format`);
    }
  }

  /**
   * Validate TODO status
   */
  static validateTodoStatus(status: string): TodoStatus {
    if (!Object.values(TodoStatus).includes(status as TodoStatus)) {
      throw new HttpErrors.ValidationError(`Invalid status: ${status}`);
    }
    return status as TodoStatus;
  }

  /**
   * Validate TODO priority
   */
  static validateTodoPriority(priority: string): TodoPriority {
    if (!Object.values(TodoPriority).includes(priority as TodoPriority)) {
      throw new HttpErrors.ValidationError(`Invalid priority: ${priority}`);
    }
    return priority as TodoPriority;
  }

  /**
   * Validate share permissions
   */
  static validateSharePermission(permission: string): SharePermission {
    if (!Object.values(SharePermission).includes(permission as SharePermission)) {
      throw new HttpErrors.ValidationError(`Invalid permission: ${permission}`);
    }
    return permission as SharePermission;
  }

  /**
   * Validate date format
   */
  static validateDate(dateString: string, fieldName = 'date'): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new HttpErrors.ValidationError(`Invalid ${fieldName} format`);
    }
    return date;
  }

  /**
   * Validate file size
   */
  static validateFileSize(fileSize: number, maxSizeBytes: number): void {
    if (fileSize > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
      throw new HttpErrors.ValidationError(`File size exceeds limit of ${maxSizeMB} MB`);
    }
  }

  /**
   * Validate media file type
   */
  static validateMediaType(mimeType: string, mediaType: MediaType): void {
    const supportedTypes = SUPPORTED_MIME_TYPES[mediaType];

    if (!supportedTypes.includes(mimeType.toLowerCase())) {
      throw new HttpErrors.ValidationError(
        `Unsupported ${mediaType} type. Supported types: ${supportedTypes.join(', ')}`,
      );
    }
  }

  /**
   * Validate video duration
   */
  static validateVideoDuration(durationSeconds: number): void {
    const MAX_VIDEO_DURATION = 4 * 60; // 4 minutes
    if (durationSeconds > MAX_VIDEO_DURATION) {
      throw new HttpErrors.ValidationError('Video duration exceeds limit of 4 minutes');
    }
  }

  /**
   * Sanitize and validate input string
   */
  static sanitizeString(input: string, maxLength: number): string {
    if (!input || typeof input !== 'string') {
      throw new HttpErrors.ValidationError('Invalid string input');
    }

    const sanitized = input.trim();
    if (sanitized.length === 0) {
      throw new HttpErrors.ValidationError('Input cannot be empty');
    }

    if (sanitized.length > maxLength) {
      throw new HttpErrors.ValidationError(
        `Input exceeds maximum length of ${maxLength} characters`,
      );
    }

    return sanitized;
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(limit?: number, offset?: number): {
    limit: number;
    offset: number;
  } {
    const DEFAULT_LIMIT = 50;
    const MAX_LIMIT = 1000;

    const validatedLimit = limit ?
      Math.max(1, Math.min(Math.floor(limit), MAX_LIMIT)) :
      DEFAULT_LIMIT;

    const validatedOffset = offset ?
      Math.max(0, Math.floor(offset)) :
      0;

    return {
      limit: validatedLimit,
      offset: validatedOffset,
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = this.sanitizeString(email, 255);

    if (!emailRegex.test(sanitized)) {
      throw new HttpErrors.ValidationError('Invalid email format');
    }

    // Additional email validation rules
    if (sanitized.length > 254) {
      throw new HttpErrors.ValidationError('Email address is too long');
    }

    const [localPart, domain] = sanitized.split('@');

    // Ensure both parts exist after split
    if (!localPart || !domain) {
      throw new HttpErrors.ValidationError('Invalid email format');
    }

    if (localPart.length > 64) {
      throw new HttpErrors.ValidationError('Email local part is too long');
    }

    if (domain.length > 253) {
      throw new HttpErrors.ValidationError('Email domain is too long');
    }

    // Check for common invalid patterns
    if (domain.includes('..')) {
      throw new HttpErrors.ValidationError('Invalid email domain format');
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      throw new HttpErrors.ValidationError('Invalid email local part format');
    }

    return sanitized;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new HttpErrors.ValidationError('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new HttpErrors.ValidationError('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new HttpErrors.ValidationError('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      throw new HttpErrors.ValidationError('Password must contain at least one number');
    }
  }
}
