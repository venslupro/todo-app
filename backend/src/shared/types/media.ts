import { z } from 'zod';

export const mediaTypeSchema = z.enum(['image', 'video']);

export const mediaFilterSchema = z.object({
  todoId: z.string().uuid().optional(),
  mediaType: mediaTypeSchema.optional(),
});

export type MediaFilter = z.infer<typeof mediaFilterSchema>;

export const generateUploadUrlSchema = z.object({
  todoId: z.string().uuid('Invalid TODO ID'),
  fileName: z.string().min(1, 'File name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSize: z.number().positive('File size must be positive').optional(),
});

export type GenerateUploadUrlRequest = z.infer<typeof generateUploadUrlSchema>;

export const confirmUploadSchema = z.object({
  uploadSuccess: z.boolean(),
});

export type ConfirmUploadRequest = z.infer<typeof confirmUploadSchema>;