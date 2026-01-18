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
    this.handleZodError(result, c);

    const userId = this.getUserId(c);
    const response = await this.mediaService.getAllMedia(userId, result.data);
    return this.success(c, response, 'Media retrieved successfully');
  });

  generateUploadUrl = zValidator('json', generateUploadUrlSchema, async (result, c) => {
    this.handleZodError(result, c);

    const userId = this.getUserId(c);
    const response = await this.mediaService.generateUploadUrl(result.data, userId);
    return this.created(c, response, 'Upload URL generated successfully');
  });

  confirmUpload = zValidator('json', confirmUploadSchema, async (result, c) => {
    this.handleZodError(result, c);

    const userId = this.getUserId(c);
    const id = (c.req.param as any)('id') as string;
    const media = await this.mediaService.confirmUpload(id, result.data, userId);
    return this.success(c, media, 'Upload confirmed successfully');
  });

  deleteMedia = async (c: Context) => {
    const userId = this.getUserId(c);
    const id = (c.req.param as any)('id') as string;
    await this.mediaService.deleteMedia(id, userId);
    return this.noContent(c, 'Media deleted successfully');
  };
}
