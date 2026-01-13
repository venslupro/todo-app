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
 * Media file data model
 */
export interface Media {
  id: string;
  todo_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: MediaType;
  duration: number | undefined; // Video duration (seconds)
  width: number | undefined; // Image/video width
  height: number | undefined; // Image/video height
  thumbnail_url: string | undefined; // Thumbnail URL
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Upload media file DTO
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
 * Media upload response
 */
export interface MediaUploadResponse {
  media: Media;
  upload_url: string;
}

/**
 * Media query parameters
 */
export interface MediaQueryParams {
  todo_id?: string;
  media_type?: MediaType;
  limit?: number;
  offset?: number;
}
