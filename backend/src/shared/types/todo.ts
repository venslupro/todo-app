import { z } from 'zod';

export const todoStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);
export const todoPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const todoFilterSchema = z.object({
  status: todoStatusSchema.optional(),
  priority: todoPrioritySchema.optional(),
  dueDateBefore: z.string().datetime().optional(),
  dueDateAfter: z.string().datetime().optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
});

export type TodoFilter = z.infer<typeof todoFilterSchema>;

export const createTodoSchema = z.object({
  name: z.string().max(200, 'Name must be at most 200 characters').min(1, 'Name is required'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  status: todoStatusSchema.default('not_started'),
  priority: todoPrioritySchema.default('medium'),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  parentId: z.string().uuid().optional(),
});

export type CreateTodoRequest = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = createTodoSchema.partial().extend({
  name: z.string().max(200, 'Name must be at most 200 characters').optional(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
});

export type UpdateTodoRequest = z.infer<typeof updateTodoSchema>;