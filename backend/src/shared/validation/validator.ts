// backend/src/lib/validation.ts
import {ValidationError} from '../errors/http-errors';
import {TodoStatus, TodoPriority, MediaType, SharePermission} from '../shared';

/**
 * 验证工具类
 */
export class Validator {
  /**
   * 验证UUID格式
   */
  static validateUUID(id: string, fieldName = 'id'): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError(`Invalid ${fieldName} format`);
    }
  }

  /**
   * 验证TODO状态
   */
  static validateTodoStatus(status: string): TodoStatus {
    if (!Object.values(TodoStatus).includes(status as TodoStatus)) {
      throw new ValidationError(`Invalid status: ${status}`);
    }
    return status as TodoStatus;
  }

  /**
   * 验证TODO优先级
   */
  static validateTodoPriority(priority: string): TodoPriority {
    if (!Object.values(TodoPriority).includes(priority as TodoPriority)) {
      throw new ValidationError(`Invalid priority: ${priority}`);
    }
    return priority as TodoPriority;
  }

  /**
   * 验证分享权限
   */
  static validateSharePermission(permission: string): SharePermission {
    if (!Object.values(SharePermission).includes(permission as SharePermission)) {
      throw new ValidationError(`Invalid permission: ${permission}`);
    }
    return permission as SharePermission;
  }

  /**
   * 验证日期格式
   */
  static validateDate(dateString: string, fieldName = 'date'): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid ${fieldName} format`);
    }
    return date;
  }

  /**
   * 验证文件大小
   */
  static validateFileSize(fileSize: number, maxSizeBytes: number): void {
    if (fileSize > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
      throw new ValidationError(`File size exceeds limit of ${maxSizeMB} MB`);
    }
  }

  /**
   * 验证媒体文件类型
   */
  static validateMediaType(mimeType: string, mediaType: MediaType): void {
    const {SUPPORTED_MIME_TYPES} = require('../models/media');
    const supportedTypes = SUPPORTED_MIME_TYPES[mediaType];
    
    if (!supportedTypes.includes(mimeType.toLowerCase())) {
      throw new ValidationError(
        `Unsupported ${mediaType} type. Supported types: ${supportedTypes.join(', ')}`,
      );
    }
  }

  /**
   * 验证视频时长
   */
  static validateVideoDuration(durationSeconds: number): void {
    const MAX_VIDEO_DURATION = 4 * 60; // 4分钟
    if (durationSeconds > MAX_VIDEO_DURATION) {
      throw new ValidationError(`Video duration exceeds limit of 4 minutes`);
    }
  }

  /**
   * 清理和验证输入字符串
   */
  static sanitizeString(input: string, maxLength: number): string {
    if (!input || typeof input !== 'string') {
      throw new ValidationError('Invalid string input');
    }
    
    const sanitized = input.trim();
    if (sanitized.length === 0) {
      throw new ValidationError('Input cannot be empty');
    }
    
    if (sanitized.length > maxLength) {
      throw new ValidationError(`Input exceeds maximum length of ${maxLength} characters`);
    }
    
    return sanitized;
  }

  /**
   * 验证分页参数
   */
  static validatePagination(limit?: number, offset?: number): {
    limit: number;
    offset: number;
  } {
    const DEFAULT_LIMIT = 50;
    const MAX_LIMIT = 1000;
    
    const validatedLimit = limit 
      ? Math.max(1, Math.min(Math.floor(limit), MAX_LIMIT))
      : DEFAULT_LIMIT;
    
    const validatedOffset = offset 
      ? Math.max(0, Math.floor(offset))
      : 0;
    
    return {
      limit: validatedLimit,
      offset: validatedOffset,
    };
  }
}