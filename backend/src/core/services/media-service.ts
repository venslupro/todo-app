// core/services/media-service.ts
import {ErrorCode, Result, okResult, errResult} from '../../shared/errors/error-codes';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../supabase/client';
import {InternalServerException, NotFoundException, ForbiddenException} from '../../shared/errors/http-exception';
import {
  Media,
  MediaType,
  MimeTypes,
  UploadMedia,
  MediaUploadResult,
  MediaQueryParams,
} from '../models/media';

/**
 * Media service class
 */
export class MediaService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(env: any) {
    this.supabase = SupabaseClient.getClient(env);
  }

  /**
   * Get media file list
   */
  async getMediaList(
    userId: string,
    params: MediaQueryParams,
  ): Promise<Result<Media[], ErrorCode>> {
    let query = this.supabase
      .from('media')
      .select('*')
      .order('created_at', {ascending: false});

    // Apply filters
    if (params.todo_id) {
      const uuidResult = Validator.validateUUID(params.todo_id);
      if (uuidResult.isErr()) {
        return errResult(uuidResult.error);
      }

      // Check TODO access permissions
      const hasAccess = await this.checkTodoAccess(params.todo_id, userId);
      if (!hasAccess) {
        return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
      }

      query = query.eq('todo_id', params.todo_id);
    }

    if (params.media_type) {
      query = query.eq('media_type', params.media_type);
    }

    // Apply pagination
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const {data, error} = await query;

    if (error) {
      console.error('Database error:', error);
      return errResult(ErrorCode.DATABASE_QUERY_FAILED);
    }

    return okResult(data as Media[]);
  }

  /**
   * Get upload URL
   */
  async getUploadUrl(
    todoId: string,
    userId: string,
    dto: UploadMedia,
  ): Promise<Result<MediaUploadResult, ErrorCode>> {
    Validator.validateUUID(todoId);

    // Check TODO edit permissions
    const canEdit = await this.checkEditPermission(todoId, userId);
    if (!canEdit) {
      return errResult(ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED);
    }

    // Determine media type
    let mediaType: MediaType;
    if (MimeTypes[MediaType.IMAGE].includes(dto.mime_type)) {
      mediaType = MediaType.IMAGE;
    } else if (MimeTypes[MediaType.VIDEO].includes(dto.mime_type)) {
      mediaType = MediaType.VIDEO;
    } else {
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL); // Using validation error code
    }

    // Validate file size
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    Validator.validateFileSize(dto.file_size, MAX_FILE_SIZE);

    // Validate video duration
    if (mediaType === MediaType.VIDEO && dto.duration) {
      Validator.validateVideoDuration(dto.duration);
    }

    // Generate file path
    const fileId = crypto.randomUUID();
    const fileName = `todo-${todoId}/${fileId}/${dto.file_name}`;
    const filePath = `todo-media/${fileName}`;

    // Get upload URL
    const {data: uploadData, error: uploadError} = await this.supabase.storage
      .from('todo-media')
      .createSignedUploadUrl(filePath);

    if (uploadError || !uploadData) {
      console.error('Storage error:', uploadError);
      throw new InternalServerException('Failed to generate upload URL');
    }

    // Create media record (pre-creation, update status after upload)
    const mediaData: any = {
      id: fileId,
      todo_id: todoId,
      file_name: dto.file_name,
      file_path: filePath,
      file_size: dto.file_size,
      mime_type: dto.mime_type,
      media_type: mediaType,
      duration: dto.duration,
      width: dto.width,
      height: dto.height,
      created_by: userId,
    };

    const {data: media, error: mediaError} = await (this.supabase as any)
      .from('media')
      .insert(mediaData)
      .select()
      .single();

    if (mediaError) {
      console.error('Database error:', mediaError);
      return errResult(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

    return okResult({
      media: media as Media,
      upload_url: uploadData.signedUrl,
    });
  }

  /**
   * Confirm upload success
   */
  async confirmUpload(
    mediaId: string,
    userId: string,
  ): Promise<Media> {
    Validator.validateUUID(mediaId);

    const {data: media, error} = await this.supabase
      .from('media')
      .select('*, todos!inner(created_by)')
      .eq('id', mediaId)
      .single();

    if (error || !media) {
      throw new NotFoundException('Media not found');
    }

    // Check permissions
    if ((media as any).todos.created_by !== userId && (media as any).created_by !== userId) {
      throw new ForbiddenException('No permission to update this media');
    }

    // Additional validation can be added here, such as checking if file actually exists in storage

    return media as Media;
  }

  /**
   * Delete media file
   */
  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    Validator.validateUUID(mediaId);

    // Get media record
    const {data: media} = await this.supabase
      .from('media')
      .select('*, todos!inner(created_by)')
      .eq('id', mediaId)
      .single();

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check permissions (only TODO creator or media uploader can delete)
    const canDelete = (media as any).todos.created_by === userId ||
      (media as any).created_by === userId;

    if (!canDelete) {
      throw new ForbiddenException('No permission to delete this media');
    }

    // Delete file from storage
    const {error: storageError} = await this.supabase.storage
      .from('todo-media')
      .remove([(media as any).file_path]);

    if (storageError) {
      console.error('Storage error:', storageError);
      // Continue deleting database record
    }

    // Delete database record
    const {error: dbError} = await this.supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new InternalServerException('Failed to delete media record');
    }
  }

  /**
   * Get media file URL
   */
  async getMediaUrl(mediaId: string, userId: string): Promise<string> {
    Validator.validateUUID(mediaId);

    const {data: media} = await this.supabase
      .from('media')
      .select('*, todos!inner(id)')
      .eq('id', mediaId)
      .single();

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check TODO access permissions
    const hasAccess = await this.checkTodoAccess((media as any).todo_id, userId);
    if (!hasAccess) {
      throw new ForbiddenException('No access to this media');
    }

    // Get file URL
    const {data: {publicUrl}} = this.supabase.storage
      .from('todo-media')
      .getPublicUrl((media as any).file_path);

    return publicUrl;
  }

  /**
   * Check TODO access permissions
   */
  private async checkTodoAccess(
    todoId: string,
    userId: string,
  ): Promise<boolean> {
    const {data} = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (!data) return false;

    // If creator, allow access
    if ((data as any).created_by === userId) return true;

    // Check if has share permission
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return !!share;
  }

  /**
   * Check edit permissions
   */
  private async checkEditPermission(
    todoId: string,
    userId: string,
  ): Promise<boolean> {
    const {data: todo} = await this.supabase
      .from('todos')
      .select('created_by')
      .eq('id', todoId)
      .eq('is_deleted', false)
      .single();

    if (!todo) return false;

    // If creator, allow editing
    if ((todo as any).created_by === userId) return true;

    // Check if has edit permission share
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('permission')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return (share as any)?.permission === 'edit';
  }
}
