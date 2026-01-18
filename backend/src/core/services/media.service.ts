import { MediaDriver, SupabaseDriver } from '../../drivers/supabase';
import { Media, MediaListResponse } from '../model/media';
import { GenerateUploadUrlRequest, ConfirmUploadRequest, MediaFilter } from '../../shared/types/media';
import { AppException } from '../../shared/exceptions/app.exception';

export class MediaService {
  private readonly mediaDriver: MediaDriver;

  constructor(supabaseDriver: SupabaseDriver) {
    this.mediaDriver = new MediaDriver(supabaseDriver);
  }

  async getAllMedia(userId: string, filters?: MediaFilter): Promise<MediaListResponse> {
    const result = await this.mediaDriver.getAllMedia(userId, filters);

    return {
      media: result.media.map((media: any) => this.mapMedia(media)),
    };
  }

  async generateUploadUrl(
    request: GenerateUploadUrlRequest,
    userId: string,
  ): Promise<{ uploadUrl: string; mediaId: string }> {
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
  }

  async confirmUpload(mediaId: string, request: ConfirmUploadRequest, userId: string): Promise<Media> {
    if (!request.uploadSuccess) {
      await this.mediaDriver.deleteMedia(mediaId, userId);
      throw AppException.badRequest('Upload failed');
    }

    const media = await this.mediaDriver.updateMedia(mediaId, {
      upload_success: true,
    }, userId);

    if (!media) {
      throw AppException.notFound('Media not found', { mediaId, userId });
    }

    return this.mapMedia(media);
  }

  async deleteMedia(id: string, userId: string): Promise<void> {
    const media = await this.mediaDriver.updateMedia(id, {}, userId);
    if (!media) {
      throw AppException.notFound('Media not found', { id, userId });
    }
    await this.mediaDriver.deleteMedia(id, userId);
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
}
