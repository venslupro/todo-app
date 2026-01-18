export type MediaType = 'image' | 'video';

export interface Media {
  id: string;
  todoId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  mediaType: MediaType;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListResponse {
  media: Media[];
}
