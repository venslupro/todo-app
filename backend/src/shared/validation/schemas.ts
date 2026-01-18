import {z} from 'zod';

/**
 * Common validation schemas for reuse across the application.
 */
export const CommonSchemas = {
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(1),
  timestamp: z.string().datetime(),
  url: z.string().url().optional(),
  positiveInt: z.number().int().positive(),
};

/**
 * User-related validation schemas.
 */
export const UserSchemas = {
  register: z.object({
    email: CommonSchemas.email,
    password: z.string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    username: z.string().min(1).optional(),
    full_name: z.string().min(1).optional(),
  }).strict(),

  login: z.object({
    email: CommonSchemas.email,
    password: CommonSchemas.password,
  }).strict(),

  refreshToken: z.object({
    refresh_token: z.string().min(1),
  }).strict(),

  profile: z.object({
    id: CommonSchemas.id,
    email: CommonSchemas.email,
    username: z.string().optional(),
    full_name: z.string().optional(),
    avatar_url: CommonSchemas.url.nullable(),
    role: z.enum(['user', 'admin']),
    created_at: CommonSchemas.timestamp,
    updated_at: CommonSchemas.timestamp,
  }),
};

/**
 * TODO-related validation schemas.
 */
export const TodoSchemas = {
  create: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    due_date: CommonSchemas.timestamp.optional(),
    tags: z.array(z.string()).optional(),
    parent_id: CommonSchemas.id.optional(),
  }).strict(),

  update: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    due_date: CommonSchemas.timestamp.optional(),
    tags: z.array(z.string()).optional(),
    parent_id: CommonSchemas.id.optional(),
    completed_at: CommonSchemas.timestamp.optional(),
  }).strict(),

  todo: z.object({
    id: CommonSchemas.id,
    name: z.string(),
    description: z.string().nullable(),
    status: z.enum(['not_started', 'in_progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).nullable(),
    due_date: CommonSchemas.timestamp.nullable(),
    tags: z.array(z.string()).nullable(),
    created_by: CommonSchemas.id,
    created_at: CommonSchemas.timestamp,
    updated_at: CommonSchemas.timestamp,
    completed_at: CommonSchemas.timestamp.nullable(),
    parent_id: CommonSchemas.id.nullable(),
    is_deleted: z.boolean(),
  }),

  query: z.object({
    status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    due_date_before: CommonSchemas.timestamp.optional(),
    due_date_after: CommonSchemas.timestamp.optional(),
    tags: z.string().optional(),
    search: z.string().optional(),
    limit: CommonSchemas.positiveInt.default(50),
    offset: z.number().int().min(0).default(0),
    sort_by: z.enum(['name', 'priority', 'due_date', 'created_at', 'updated_at']).optional(),
    sort_order: z.enum(['asc', 'desc']).default('desc'),
  }).strict(),
};

/**
 * Media-related validation schemas.
 */
export const MediaSchemas = {
  upload: z.object({
    todo_id: CommonSchemas.id.optional(),
    description: z.string().optional(),
  }).strict(),

  query: z.object({
    todo_id: CommonSchemas.id.optional(),
    media_type: z.enum(['image', 'video']).optional(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }).strict(),

  media: z.object({
    id: CommonSchemas.id,
    todo_id: CommonSchemas.id.nullable(),
    filename: z.string(),
    original_name: z.string(),
    mime_type: z.string(),
    size: z.number().int().positive(),
    description: z.string().nullable(),
    created_by: CommonSchemas.id,
    created_at: CommonSchemas.timestamp,
    updated_at: CommonSchemas.timestamp,
    url: z.string(),
    is_deleted: z.boolean(),
  }),
};

/**
 * Team-related validation schemas.
 */
export const TeamSchemas = {
  create: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }).strict(),

  update: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }).strict(),

  team: z.object({
    id: CommonSchemas.id,
    name: z.string(),
    description: z.string().nullable(),
    created_by: CommonSchemas.id,
    created_at: CommonSchemas.timestamp,
    updated_at: CommonSchemas.timestamp,
    is_deleted: z.boolean(),
  }),

  member: z.object({
    team_id: CommonSchemas.id,
    user_id: CommonSchemas.id,
    role: z.enum(['member', 'admin']),
    joined_at: CommonSchemas.timestamp,
  }),

  createShare: z.object({
    todo_id: CommonSchemas.id,
    user_id: CommonSchemas.id,
    permission: z.enum(['view', 'edit']),
  }).strict(),

  updateShare: z.object({
    permission: z.enum(['view', 'edit']),
  }).strict(),

  share: z.object({
    id: CommonSchemas.id,
    todo_id: CommonSchemas.id,
    user_id: CommonSchemas.id,
    permission: z.enum(['view', 'edit']),
    shared_by: CommonSchemas.id,
    created_at: CommonSchemas.timestamp,
    updated_at: CommonSchemas.timestamp,
  }),

  shareQuery: z.object({
    todo_id: CommonSchemas.id.optional(),
    user_id: CommonSchemas.id.optional(),
    permission: z.enum(['view', 'edit']).optional(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }),
};

/**
 * System-related validation schemas.
 */
export const SystemSchemas = {
  health: z.object({
    status: z.enum(['healthy', 'unhealthy']),
    timestamp: CommonSchemas.timestamp,
    environment: z.enum(['development', 'production', 'staging']),
  }),

  version: z.object({
    name: z.string(),
    version: z.string(),
    environment: z.enum(['development', 'production', 'staging']),
  }),
};

/**
 * Response schemas for consistent API responses.
 */
export const ResponseSchemas = {
  success: <T extends z.ZodType>(dataSchema: T) =>
    z.object({
      code: z.number().int().positive(),
      message: z.string(),
      data: dataSchema,
    }),

  error: z.object({
    code: z.number().int().positive(),
    message: z.string(),
    details: z.string().optional(),
  }),

  paginated: <T extends z.ZodType>(dataSchema: T) =>
    z.object({
      todos: z.array(dataSchema),
      total: z.number().int().min(0),
      limit: z.number().int().positive(),
      offset: z.number().int().min(0),
    }),
};

/**
 * Authentication-related schemas.
 */
export const AuthSchemas = {
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number().int().positive(),
  }),

  loginResponse: z.object({
    user: UserSchemas.profile,
    session: z.object({
      access_token: z.string(),
      refresh_token: z.string(),
      expires_in: z.number().int().positive(),
    }),
  }),

  registerResponse: z.object({
    user: UserSchemas.profile,
    session: z.object({
      access_token: z.string(),
      refresh_token: z.string(),
      expires_in: z.number().int().positive(),
    }),
  }),
};
