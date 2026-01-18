import { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { MediaService } from '../../core/services/media.service';
import { BaseHandler } from './base.handler';
import { generateUploadUrlSchema, confirmUploadSchema, mediaFilterSchema } from '../../shared/types/media';

export class MediaHandler extends BaseHandler {
  constructor(private mediaService: MediaService) {
    super();
  }

  getAllMedia = zValidator('query', mediaFilterSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const userId = this.getUserId(c);
      const response = await this.mediaService.getAllMedia(userId, result.data);
      return this.success(c, response);
    } catch (error: any) {
      return this.internalError(c, error.message);
    }
  });

  generateUploadUrl = zValidator('json', generateUploadUrlSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const userId = this.getUserId(c);
      const response = await this.mediaService.generateUploadUrl(result.data, userId);
      return this.created(c, response);
    } catch (error: any) {
      if (error.message.includes('Invalid')) {
        return this.badRequest(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  });

  confirmUpload = zValidator('json', confirmUploadSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const userId = this.getUserId(c);
      const id = (c.req.param as any)('id') as string;
      const media = await this.mediaService.confirmUpload(id, result.data, userId);
      return this.success(c, media);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return this.notFound(c, 'Media not found');
      }
      if (error.message.includes('Upload failed')) {
        return this.badRequest(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  });

  deleteMedia = async (c: Context) => {
    try {
      const userId = this.getUserId(c);
      const id = (c.req.param as any)('id') as string;
      await this.mediaService.deleteMedia(id, userId);
      return this.noContent(c);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return this.notFound(c, 'Media not found');
      }
      return this.internalError(c, error.message);
    }
  };
}
