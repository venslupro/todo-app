import { Context } from 'hono';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1)
});

const createTodoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  tags: z.array(z.string()).optional(),
  assignee_id: z.string().optional(),
  team_id: z.string().optional()
});

const updateTodoSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  tags: z.array(z.string()).optional(),
  assignee_id: z.string().optional(),
  team_id: z.string().optional()
});

const createTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
});

const addTeamMemberSchema = z.object({
  user_id: z.string().min(1),
  role: z.enum(['MEMBER', 'ADMIN']).optional()
});

const schemas = {
  register: registerSchema,
  login: loginSchema,
  refresh: refreshSchema,
  createTodo: createTodoSchema,
  updateTodo: updateTodoSchema,
  createTeam: createTeamSchema,
  updateTeam: updateTeamSchema,
  addTeamMember: addTeamMemberSchema
};

export function validate(schemaName: keyof typeof schemas) {
  return async (c: Context, next: Function) => {
    const schema = schemas[schemaName];
    
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedData', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        }, 400);
      }
      
      return c.json({
        error: 'Bad Request',
        message: 'Invalid JSON format'
      }, 400);
    }
  };
}