// src/schemas/index.ts
// Zod validation schemas for request and response validation

import {z} from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().optional(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().nullable().optional(),
  role: z.enum(['user', 'admin']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Session schemas
export const sessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int().positive(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  session: sessionSchema,
});

// Todo schemas
export const todoBaseSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  due_date: z.string().datetime().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional().default('not_started'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  tags: z.array(z.string()).optional().default([]),
  parent_id: z.string().uuid().optional(),
});

export const todoSchema = todoBaseSchema.extend({
  id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable().optional(),
  is_deleted: z.boolean(),
});

export const createTodoSchema = todoBaseSchema;

export const updateTodoSchema = todoBaseSchema.partial();

export const todoFilterSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date_before: z.string().datetime().optional(),
  due_date_after: z.string().datetime().optional(),
  tags: z.string().transform((val) => val.split(',')).optional(),
  search: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  sort_by: z.enum(['name', 'priority', 'due_date', 'created_at', 'updated_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Media schemas
export const mediaBaseSchema = z.object({
  todo_id: z.string().uuid(),
  file_name: z.string(),
  mime_type: z.string(),
  file_size: z.number().int().min(0).optional(),
});

export const mediaSchema = mediaBaseSchema.extend({
  id: z.string().uuid(),
  file_path: z.string(),
  media_type: z.enum(['image', 'video']),
  duration: z.number().int().min(0).nullable().optional(),
  width: z.number().int().min(0).nullable().optional(),
  height: z.number().int().min(0).nullable().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const generateUploadUrlSchema = mediaBaseSchema;

export const confirmUploadSchema = z.object({
  upload_success: z.boolean(),
});

export const mediaFilterSchema = z.object({
  todo_id: z.string().uuid().optional(),
  media_type: z.enum(['image', 'video']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

// Team schemas
export const shareTodoSchema = z.object({
  todo_id: z.string().uuid(),
  user_id: z.string().uuid(),
  permission: z.enum(['view', 'edit']),
});

export const updateShareSchema = z.object({
  permission: z.enum(['view', 'edit']),
});

export const teamMemberFilterSchema = z.object({
  todo_id: z.string().uuid().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
  username: z.string().optional(),
  full_name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string(),
});

// Response schemas
export const successResponseSchema = z.object({
  code: z.number().int(),
  message: z.string(),
  data: z.any(),
});

export const errorResponseSchema = z.object({
  code: z.number().int(),
  message: z.string(),
  details: z.string().optional(),
});

// Health check schemas
export const healthCheckSchema = z.object({
  status: z.string(),
  timestamp: z.string().datetime(),
  environment: z.string(),
});

export const versionInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  environment: z.string(),
});
