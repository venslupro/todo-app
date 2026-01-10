// core/services/media-service.ts
import {HttpErrors} from '../../shared/errors/http-errors';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../../shared/supabase/client';
import {
  Media,
  MediaType,
  SUPPORTED_MIME_TYPES,
  UploadMediaDto,
  MediaUploadResponse,
  MediaQueryParams,
} from '../models/media';

/**
 * 媒体服务类
 */
export class MediaService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(env: any) {
    this.supabase = SupabaseClient.getClient(env);
  }

  /**
   * 获取媒体文件列表
   */
  async getMediaList(
    userId: string,
    params: MediaQueryParams,
  ): Promise<Media[]> {
    let query = this.supabase
      .from('media')
      .select('*')
      .order('created_at', {ascending: false});

    // 应用过滤器
    if (params.todo_id) {
      Validator.validateUUID(params.todo_id, 'todo_id');

      // 检查TODO访问权限
      const hasAccess = await this.checkTodoAccess(params.todo_id, userId);
      if (!hasAccess) {
        throw new HttpErrors.ForbiddenError('No access to this todo');
      }

      query = query.eq('todo_id', params.todo_id);
    }

    if (params.media_type) {
      query = query.eq('media_type', params.media_type);
    }

    // 应用分页
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const {data, error} = await query;

    if (error) {
      console.error('Database error:', error);
      throw new HttpErrors.InternalServerError('Failed to fetch media');
    }

    return data as Media[];
  }

  /**
   * 获取上传URL
   */
  async getUploadUrl(
    todoId: string,
    userId: string,
    dto: UploadMediaDto,
  ): Promise<MediaUploadResponse> {
    Validator.validateUUID(todoId, 'todo_id');

    // 检查TODO编辑权限
    const canEdit = await this.checkEditPermission(todoId, userId);
    if (!canEdit) {
      throw new HttpErrors.ForbiddenError('No permission to upload media to this todo');
    }

    // 确定媒体类型
    let mediaType: MediaType;
    if (SUPPORTED_MIME_TYPES[MediaType.IMAGE].includes(dto.mime_type)) {
      mediaType = MediaType.IMAGE;
    } else if (SUPPORTED_MIME_TYPES[MediaType.VIDEO].includes(dto.mime_type)) {
      mediaType = MediaType.VIDEO;
    } else {
      throw new HttpErrors.ValidationError(`Unsupported file type: ${dto.mime_type}`);
    }

    // 验证文件大小
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    Validator.validateFileSize(dto.file_size, MAX_FILE_SIZE);

    // 验证视频时长
    if (mediaType === MediaType.VIDEO && dto.duration) {
      Validator.validateVideoDuration(dto.duration);
    }

    // 生成文件路径
    const fileId = crypto.randomUUID();
    const fileName = `todo-${todoId}/${fileId}/${dto.file_name}`;
    const filePath = `todo-media/${fileName}`;

    // 获取上传URL
    const {data: uploadData, error: uploadError} = await this.supabase.storage
      .from('todo-media')
      .createSignedUploadUrl(filePath);

    if (uploadError || !uploadData) {
      console.error('Storage error:', uploadError);
      throw new HttpErrors.InternalServerError('Failed to generate upload URL');
    }

    // 创建媒体记录（预创建，上传后更新状态）
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
      throw new HttpErrors.InternalServerError('Failed to create media record');
    }

    return {
      media: media as Media,
      upload_url: uploadData.signedUrl,
    };
  }

  /**
   * 确认上传成功
   */
  async confirmUpload(
    mediaId: string,
    userId: string,
  ): Promise<Media> {
    Validator.validateUUID(mediaId, 'media_id');

    const {data: media, error} = await this.supabase
      .from('media')
      .select('*, todos!inner(created_by)')
      .eq('id', mediaId)
      .single();

    if (error || !media) {
      throw new HttpErrors.NotFoundError('Media not found');
    }

    // 检查权限
    if ((media as any).todos.created_by !== userId && (media as any).created_by !== userId) {
      throw new HttpErrors.ForbiddenError('No permission to update this media');
    }

    // 这里可以添加额外的验证，比如检查文件是否确实存在于存储中

    return media as Media;
  }

  /**
   * 删除媒体文件
   */
  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    Validator.validateUUID(mediaId, 'media_id');

    // 获取媒体记录
    const {data: media} = await this.supabase
      .from('media')
      .select('*, todos!inner(created_by)')
      .eq('id', mediaId)
      .single();

    if (!media) {
      throw new HttpErrors.NotFoundError('Media not found');
    }

    // 检查权限（只有TODO创建者或媒体上传者可以删除）
    const canDelete = (media as any).todos.created_by === userId ||
      (media as any).created_by === userId;

    if (!canDelete) {
      throw new HttpErrors.ForbiddenError('No permission to delete this media');
    }

    // 从存储中删除文件
    const {error: storageError} = await this.supabase.storage
      .from('todo-media')
      .remove([(media as any).file_path]);

    if (storageError) {
      console.error('Storage error:', storageError);
      // 继续删除数据库记录
    }

    // 删除数据库记录
    const {error: dbError} = await this.supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new HttpErrors.InternalServerError('Failed to delete media record');
    }
  }

  /**
   * 获取媒体文件URL
   */
  async getMediaUrl(mediaId: string, userId: string): Promise<string> {
    Validator.validateUUID(mediaId, 'media_id');

    const {data: media} = await this.supabase
      .from('media')
      .select('*, todos!inner(id)')
      .eq('id', mediaId)
      .single();

    if (!media) {
      throw new HttpErrors.NotFoundError('Media not found');
    }

    // 检查TODO访问权限
    const hasAccess = await this.checkTodoAccess((media as any).todo_id, userId);
    if (!hasAccess) {
      throw new HttpErrors.ForbiddenError('No access to this media');
    }

    // 获取文件URL
    const {data: {publicUrl}} = this.supabase.storage
      .from('todo-media')
      .getPublicUrl((media as any).file_path);

    return publicUrl;
  }

  /**
   * 检查TODO访问权限
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

    // 如果是创建者，允许访问
    if ((data as any).created_by === userId) return true;

    // 检查是否有分享权限
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('id')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return !!share;
  }

  /**
   * 检查编辑权限
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

    // 如果是创建者，允许编辑
    if ((todo as any).created_by === userId) return true;

    // 检查是否有编辑权限的分享
    const {data: share} = await this.supabase
      .from('todo_shares')
      .select('permission')
      .eq('todo_id', todoId)
      .eq('user_id', userId)
      .single();

    return (share as any)?.permission === 'edit';
  }
}
