import {Hono} from 'hono';
import {zValidator} from '@hono/zod-validator';
import {z} from 'zod';
import {HTTPException} from 'hono/http-exception';
import {TodoService} from '../../core/services/todo-service';
import {AppConfig} from '../../shared/config/app-config';
import {
  BadRequestException,
  InternalServerException,
  SuccessResponse,
  NotFoundException,
} from '../../shared/errors/http-exception';
import {EnvironmentConfig, UserInfo} from '../../shared/types/hono-types';
import {BusinessLogger} from '../middleware/logger';
import {BearerAuthMiddleware} from '../middleware/bearer-auth';
import {TodoSchemas} from '../../shared/validation/schemas';
import {TodoStatus, TodoPriority} from '../../core/models/todo';

const router = new Hono<{
  Bindings: EnvironmentConfig;
  Variables: { user: UserInfo };
}>();

/**
 * Creates a TODO service instance.
 */
function createTodoService(c: {env: EnvironmentConfig}): TodoService {
  const appConfig = new AppConfig(c.env);
  return new TodoService(appConfig);
}

/**
 * Get all TODOs with filtering and pagination.
 * GET /api/v1/todos
 */
router.get(
  '/',
  BearerAuthMiddleware.create(),
  async (c) => {
    try {
      const user = c.get('user');

      // Extract query parameters manually since zValidator has issues
      const statusStr = c.req.query('status');
      const priorityStr = c.req.query('priority');
      const dueDateBefore = c.req.query('due_date_before');
      const dueDateAfter = c.req.query('due_date_after');
      const tags = c.req.query('tags') ? c.req.query('tags')!.split(',') : undefined;
      const search = c.req.query('search');
      const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50;
      const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0;
      const sortBy = c.req.query('sort_by') as
        'name' | 'priority' | 'due_date' | 'created_at' | 'updated_at' | undefined;
      const sortOrder = c.req.query('sort_order') as 'asc' | 'desc' | undefined;

      // Convert string values to enum types
      const status = statusStr === 'not_started' ? TodoStatus.NOT_STARTED :
        statusStr === 'in_progress' ? TodoStatus.IN_PROGRESS :
          statusStr === 'completed' ? TodoStatus.COMPLETED : undefined;

      const priority = priorityStr === 'low' ? TodoPriority.LOW :
        priorityStr === 'medium' ? TodoPriority.MEDIUM :
          priorityStr === 'high' ? TodoPriority.HIGH :
            priorityStr === 'urgent' ? TodoPriority.URGENT : undefined;

      const queryParams = {
        status,
        priority,
        due_date_before: dueDateBefore,
        due_date_after: dueDateAfter,
        tags,
        search,
        limit,
        offset,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      BusinessLogger.debug('Get TODOs request', {
        userId: user.id,
        queryParams,
        environment: c.env.environment || 'unknown',
      });

      const todoService = createTodoService(c);
      const result = await todoService.getTodos(user.id, queryParams);

      if (result.isErr()) {
        BusinessLogger.warn('Get TODOs failed', {
          userId: user.id,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Get TODOs successful', {
        userId: user.id,
        count: result.value.todos.length,
        total: result.value.total,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse(result.value);
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting TODOs', error as Error, {
        userId: c.get('user')?.id,
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Get TODO by ID.
 * GET /api/v1/todos/:id
 */
router.get(
  '/:id',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: TodoSchemas.todo.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const todoId = validatedParams.id;

      BusinessLogger.debug('Get TODO request', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const todoService = createTodoService(c);
      const result = await todoService.getTodo(todoId, user.id);

      if (result.isErr()) {
        BusinessLogger.warn('Get TODO failed', {
          userId: user.id,
          todoId: todoId,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new NotFoundException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Get TODO successful', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({todo: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error getting TODO', error as Error, {
        userId: c.get('user')?.id,
        todoId: c.req.param('id'),
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Create TODO.
 * POST /api/v1/todos
 */
router.post(
  '/',
  BearerAuthMiddleware.create(),
  zValidator('json', TodoSchemas.create),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedData = c.req.valid('json');

      BusinessLogger.debug('Create TODO request', {
        userId: user.id,
        todoName: validatedData.name,
        environment: c.env.environment || 'unknown',
      });

      const todoService = createTodoService(c);
      const result = await todoService.create(user.id, {
        ...validatedData,
        status: validatedData.status as TodoStatus,
        priority: validatedData.priority as TodoPriority,
      });

      if (result.isErr()) {
        BusinessLogger.warn('Create TODO failed', {
          userId: user.id,
          todoName: validatedData.name,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Create TODO successful', {
        userId: user.id,
        todoId: result.value.id,
        todoName: result.value.name,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({todo: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error creating TODO', error as Error, {
        userId: c.get('user')?.id,
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Update TODO.
 * PUT /api/v1/todos/:id
 */
router.put(
  '/:id',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: TodoSchemas.todo.shape.id})),
  zValidator('json', TodoSchemas.update),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const validatedData = c.req.valid('json');
      const todoId = validatedParams.id;

      BusinessLogger.debug('Update TODO request', {
        userId: user.id,
        todoId: todoId,
        updateFields: Object.keys(validatedData),
        environment: c.env.environment || 'unknown',
      });

      const todoService = createTodoService(c);
      const result = await todoService.updateTodo(todoId, user.id, {
        ...validatedData,
        status: validatedData.status as TodoStatus,
        priority: validatedData.priority as TodoPriority,
      });

      if (result.isErr()) {
        BusinessLogger.warn('Update TODO failed', {
          userId: user.id,
          todoId: todoId,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Update TODO successful', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({todo: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error updating TODO', error as Error, {
        userId: c.get('user')?.id,
        todoId: c.req.param('id'),
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Delete TODO.
 * DELETE /api/v1/todos/:id
 */
router.delete(
  '/:id',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: TodoSchemas.todo.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const todoId = validatedParams.id;

      BusinessLogger.debug('Delete TODO request', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const todoService = createTodoService(c);
      const result = await todoService.deleteTodo(todoId, user.id);

      if (result.isErr()) {
        BusinessLogger.warn('Delete TODO failed', {
          userId: user.id,
          todoId: todoId,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Delete TODO successful', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({message: 'TODO deleted successfully'});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error deleting TODO', error as Error, {
        userId: c.get('user')?.id,
        todoId: c.req.param('id'),
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Mark TODO as completed.
 * POST /api/v1/todos/:id/complete
 */
router.post(
  '/:id/complete',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: TodoSchemas.todo.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const todoId = validatedParams.id;

      BusinessLogger.debug('Complete TODO request', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const todoService = createTodoService(c);
      const result = await todoService.updateTodo(todoId, user.id, {
        status: 'completed' as any,
      });

      if (result.isErr()) {
        BusinessLogger.warn('Complete TODO failed', {
          userId: user.id,
          todoId: todoId,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Complete TODO successful', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({todo: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error completing TODO', error as Error, {
        userId: c.get('user')?.id,
        todoId: c.req.param('id'),
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

/**
 * Reopen TODO.
 * POST /api/v1/todos/:id/reopen
 */
router.post(
  '/:id/reopen',
  BearerAuthMiddleware.create(),
  zValidator('param', z.object({id: TodoSchemas.todo.shape.id})),
  async (c) => {
    try {
      const user = c.get('user');
      const validatedParams = c.req.valid('param');
      const todoId = validatedParams.id;

      BusinessLogger.debug('Reopen TODO request', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const todoService = createTodoService(c);
      const result = await todoService.updateTodo(todoId, user.id, {
        status: 'in_progress' as any,
      });

      if (result.isErr()) {
        BusinessLogger.warn('Reopen TODO failed', {
          userId: user.id,
          todoId: todoId,
          error: result.error,
          environment: c.env.environment || 'unknown',
        });

        const exception = new BadRequestException(result.error);
        return exception.getResponse();
      }

      BusinessLogger.debug('Reopen TODO successful', {
        userId: user.id,
        todoId: todoId,
        environment: c.env.environment || 'unknown',
      });

      const response = new SuccessResponse({todo: result.value});
      return response.getResponse();
    } catch (error) {
      BusinessLogger.error('Unexpected error reopening TODO', error as Error, {
        userId: c.get('user')?.id,
        todoId: c.req.param('id'),
      });

      if (error instanceof HTTPException) {
        return error.getResponse();
      }

      const exception = new InternalServerException(error);
      return exception.getResponse();
    }
  },
);

export default router;
