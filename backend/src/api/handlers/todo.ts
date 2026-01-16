// api/handlers/todo.ts
import {Hono} from 'hono';
import {jwt} from 'hono/jwt';
import {HTTPException} from 'hono/http-exception';
import {Context, Next} from 'hono';
import {HonoAppType} from '../../shared/types/hono-types';
import {TodoService} from '../../core/services/todo-service';
import {
  TodoStatus,
  TodoPriority,
} from '../../core/models/todo';
import {AppConfig} from '../../shared/config/app-config';
import {
  BadRequestException,
  InternalServerException,
  SuccessResponse,
  NotFoundException,
} from '../../shared/errors/http-exception';
import {BusinessLogger} from '../middleware/logger';

// Define JWT variables type for type safety
type JwtVariables = {
  jwtPayload: {
    sub: string;
    email?: string;
    iat: number;
    exp: number;
  };
};

const router = new Hono<HonoAppType & {
  Variables: JwtVariables;
}>();

/**
 * Creates a TODO service instance.
 */
function createTodoService(c: {env: Record<string, unknown>}): TodoService {
  const config = new AppConfig(c.env);
  return new TodoService(config);
}

/**
 * JWT middleware for protected routes.
 */
const jwtMiddleware = (c: Context, next: Next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256',
  });
  return jwtMiddleware(c, next);
};

/**
 * Gets TODO list.
 * GET /api/v1/todos
 */
router.get('/', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const query = c.req.query();

    BusinessLogger.info('Fetching TODO list', {
      userId: userId,
      queryParams: query,
    });

    const sortBy = query['sort_by'];
    const validSortBy = ['name', 'priority', 'due_date', 'created_at', 'updated_at'];

    const params = {
      status: query['status'] as TodoStatus,
      priority: query['priority'] as TodoPriority,
      due_date_before: query['due_date_before'],
      due_date_after: query['due_date_after'],
      tags: query['tags'] ? query['tags'].split(',') : undefined,
      search: query['search'],
      limit: query['limit'] ? parseInt(query['limit']) : undefined,
      offset: query['offset'] ? parseInt(query['offset']) : undefined,
      sort_by: validSortBy.includes(sortBy || '') ?
        sortBy as 'name' | 'priority' | 'due_date' | 'created_at' | 'updated_at' :
        undefined,
      sort_order: query['sort_order'] as 'asc' | 'desc',
    };

    const todoService = createTodoService(c);
    const result = await todoService.getTodos(userId, params);

    if (result.isErr()) {
      BusinessLogger.error('Failed to fetch TODO list', new Error(result.error), {
        userId: userId,
        error: result.error,
      });
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('Successfully fetched TODO list', {
      userId: userId,
      todoCount: result.value.todos.length,
      totalCount: result.value.total,
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error while fetching TODO list', error as Error, {
      userId: c.get('jwtPayload')?.sub,
    });
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Create TODO.
 * POST /api/v1/todos
 */
router.post('/', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const body = await c.req.json();

    BusinessLogger.info('Creating new TODO', {
      userId: userId,
      todoData: {name: body.name, priority: body.priority, status: body.status},
    });

    const todoService = createTodoService(c);
    const result = await todoService.create(userId, body);

    if (result.isErr()) {
      BusinessLogger.error('Failed to create TODO', new Error(result.error), {
        userId: userId,
        error: result.error,
        todoData: body,
      });
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('Successfully created TODO', {
      userId: userId,
      todoId: result.value.id,
      todoName: result.value.name,
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error while creating TODO', error as Error, {
      userId: c.get('jwtPayload')?.sub,
    });
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Get single TODO.
 * GET /api/v1/todos/:id
 */
router.get('/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const todoId = c.req.param('id');

    BusinessLogger.info('Fetching single TODO', {
      userId: userId,
      todoId: todoId,
    });

    const todoService = createTodoService(c);
    const result = await todoService.getTodo(todoId, userId);

    if (result.isErr()) {
      BusinessLogger.warn('TODO not found', {
        userId: userId,
        todoId: todoId,
        error: result.error,
      });
      const exception = new NotFoundException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('Successfully fetched TODO', {
      userId: userId,
      todoId: todoId,
      todoName: result.value.name,
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error while fetching TODO', error as Error, {
      userId: c.get('jwtPayload')?.sub,
      todoId: c.req.param('id'),
    });
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Update TODO.
 * PUT /api/v1/todos/:id
 */
router.put('/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const todoId = c.req.param('id');
    const body = await c.req.json();

    BusinessLogger.info('Updating TODO', {
      userId: userId,
      todoId: todoId,
      updateData: Object.keys(body),
    });

    const todoService = createTodoService(c);
    const result = await todoService.updateTodo(todoId, userId, body);

    if (result.isErr()) {
      BusinessLogger.error('Failed to update TODO', new Error(result.error), {
        userId: userId,
        todoId: todoId,
        error: result.error,
        updateData: body,
      });
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('Successfully updated TODO', {
      userId: userId,
      todoId: todoId,
      todoName: result.value.name,
    });

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error while updating TODO', error as Error, {
      userId: c.get('jwtPayload')?.sub,
      todoId: c.req.param('id'),
    });
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

/**
 * Delete TODO.
 * DELETE /api/v1/todos/:id
 */
router.delete('/:id', jwtMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    const todoId = c.req.param('id');

    BusinessLogger.info('Deleting TODO', {
      userId: userId,
      todoId: todoId,
    });

    const todoService = createTodoService(c);
    const result = await todoService.deleteTodo(todoId, userId);

    if (result.isErr()) {
      BusinessLogger.error('Failed to delete TODO', new Error(result.error), {
        userId: userId,
        todoId: todoId,
        error: result.error,
      });
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    BusinessLogger.info('Successfully deleted TODO', {
      userId: userId,
      todoId: todoId,
    });

    const response = new SuccessResponse({success: true});
    return response.getResponse();
  } catch (error) {
    BusinessLogger.error('Unexpected error while deleting TODO', error as Error, {
      userId: c.get('jwtPayload')?.sub,
      todoId: c.req.param('id'),
    });
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

export default router;

