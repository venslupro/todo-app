// core/models/media.ts
/**
 * Media type enumeration
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

/**
 * Supported MIME types
 */
export const SUPPORTED_MIME_TYPES = {
  [MediaType.IMAGE]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  [MediaType.VIDEO]: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ],
};

/**
 * 媒体文件数据模型
 */
export interface Media {
  id: string;
  todo_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: MediaType;
  duration: number | undefined; // 视频时长（秒）
  width: number | undefined; // 图片/视频宽度
  height: number | undefined; // 图片/视频高度
  thumbnail_url: string | undefined; // 缩略图URL
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * 上传媒体文件DTO
 */
export interface UploadMediaDto {
  todo_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  duration?: number;
  width?: number;
  height?: number;
}

/**
 * 媒体上传响应
 */
export interface MediaUploadResponse {
  media: Media;
  upload_url: string;
}

/**
 * 媒体查询参数
 */
export interface MediaQueryParams {
  todo_id?: string;
  media_type?: MediaType;
  limit?: number;
  offset?: number;
}
