// src/api/handlers/media.ts
// Media API handlers for media management

import {Context} from 'hono';
import {MediaService} from '../../core/services/media';
import {
  ValidationException,
  NotFoundException,
  InternalServerException,
} from '../../shared/errors/http-exception';
import {
  generateUploadUrlSchema,
  confirmUploadSchema,
  mediaFilterSchema,
} from '../../shared/schemas';
import {getUserIdFromContext} from '../../shared/utils';

interface MediaHandlerOptions {
  mediaService: MediaService;
}

export class MediaHandler {
  private readonly mediaService: MediaService;

  constructor(options: MediaHandlerOptions) {
    this.mediaService = options.mediaService;
  }

  /**
   * Get all media items with filtering options
   */
  async getAllMedia(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Extract and validate query parameters
      const validated = mediaFilterSchema.safeParse(c.req.query());
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to get media
      const result = await this.mediaService.getMedia(userId, validated.data);

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      return c.json({
        code: 200,
        message: 'Success',
        data: {media: result.value},
      });
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }

  /**
   * Generate a presigned upload URL for media
   */
  async generateUploadUrl(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Validate request body
      const body = await c.req.json();
      const validated = generateUploadUrlSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to generate upload URL
      const result = await this.mediaService.generateUploadUrl(
        userId,
        validated.data.todo_id,
        validated.data.file_name,
        validated.data.mime_type,
        validated.data.file_size || 0,
      );

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      return c.json({
        code: 200,
        message: 'Success',
        data: result.value,
      });
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }

  /**
   * Confirm upload completion
   */
  async confirmUpload(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Get media ID from path parameters
      const mediaId = c.req.param('id');
      if (!mediaId) {
        throw new ValidationException('Media ID is required');
      }

      // Validate request body
      const body = await c.req.json();
      const validated = confirmUploadSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to confirm upload
      const result = await this.mediaService.confirmUpload(
        mediaId,
        userId,
        validated.data.upload_success,
      );

      if (result.isErr()) {
        throw new NotFoundException(result.error.message);
      }

      return c.json({
        code: 200,
        message: 'Success',
        data: {media: result.value},
      });
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }
}

export const createMediaHandler = (options: MediaHandlerOptions): MediaHandler => {
  return new MediaHandler(options);
};
