import { MediaDriver, SupabaseDriver } from '../../drivers/supabase';
import { Media, MediaListResponse } from '../model/media';
import { GenerateUploadUrlRequest, ConfirmUploadRequest, MediaFilter } from '../../shared/types/media';
import { ApiError } from '../../shared/types/common';

export class MediaService {
  private mediaDriver: MediaDriver;

  constructor(supabaseDriver: SupabaseDriver) {
    this.mediaDriver = new MediaDriver(supabaseDriver);
  }

  async getAllMedia(userId: string, filters?: MediaFilter): Promise<MediaListResponse> {
    try {
      const result = await this.mediaDriver.getAllMedia(userId, filters);

      return {
        media: result.media.map((media: any) => this.mapMedia(media)),
      };
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async generateUploadUrl(
    request: GenerateUploadUrlRequest,
    userId: string,
  ): Promise<{ uploadUrl: string; mediaId: string }> {
    try {
      const mediaId = crypto.randomUUID();
      const filePath = `media/${request.todoId}/${mediaId}-${request.fileName}`;

      const mediaData = {
        id: mediaId,
        todo_id: request.todoId,
        file_name: request.fileName,
        file_path: filePath,
        file_size: request.fileSize || 0,
        mime_type: request.mimeType,
        media_type: this.determineMediaType(request.mimeType),
      };

      await this.mediaDriver.createMedia(mediaData, userId);

      return {
        uploadUrl: `https://storage.example.com/upload/${filePath}`,
        mediaId,
      };
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async confirmUpload(mediaId: string, request: ConfirmUploadRequest, userId: string): Promise<Media> {
    try {
      if (!request.uploadSuccess) {
        await this.mediaDriver.deleteMedia(mediaId, userId);
        throw new Error('Upload failed');
      }

      const media = await this.mediaDriver.updateMedia(mediaId, {
        upload_success: true,
      }, userId);

      return this.mapMedia(media);
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async deleteMedia(id: string, userId: string): Promise<void> {
    try {
      await this.mediaDriver.deleteMedia(id, userId);
    } catch (error: any) {
      if (error.code === 'PGRST116') {
        throw {
          code: 404,
          message: 'Not Found',
          details: 'Media not found',
        } as ApiError;
      }
      throw this.mapError(error);
    }
  }

  private determineMediaType(mimeType: string): 'image' | 'video' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    return 'image';
  }

  private mapMedia(supabaseMedia: any): Media {
    return {
      id: supabaseMedia.id,
      todoId: supabaseMedia.todo_id,
      fileName: supabaseMedia.file_name,
      filePath: supabaseMedia.file_path,
      fileSize: supabaseMedia.file_size,
      mimeType: supabaseMedia.mime_type,
      mediaType: supabaseMedia.media_type,
      duration: supabaseMedia.duration,
      width: supabaseMedia.width,
      height: supabaseMedia.height,
      createdBy: supabaseMedia.created_by,
      createdAt: supabaseMedia.created_at,
      updatedAt: supabaseMedia.updated_at,
    };
  }

  private mapError(error: any): ApiError {
    if (error.code === '23505') {
      return {
        code: 409,
        message: 'Conflict',
        details: 'Media already exists',
      };
    }

    if (error.code === '23503') {
      return {
        code: 400,
        message: 'Bad Request',
        details: 'Invalid TODO reference',
      };
    }

    return {
      code: 500,
      message: 'Internal Server Error',
      details: error.message,
    };
  }
}
