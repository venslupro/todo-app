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
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
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

    const todoService = createTodoService(c);
    const result = await todoService.create(userId, body);

    if (result.isErr()) {
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
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

    const todoService = createTodoService(c);
    const result = await todoService.getTodo(todoId, userId);

    if (result.isErr()) {
      const exception = new NotFoundException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
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

    const todoService = createTodoService(c);
    const result = await todoService.updateTodo(todoId, userId, body);

    if (result.isErr()) {
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse(result.value);
    return response.getResponse();
  } catch (error) {
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

    const todoService = createTodoService(c);
    const result = await todoService.deleteTodo(todoId, userId);

    if (result.isErr()) {
      const exception = new BadRequestException(result.error);
      return exception.getResponse();
    }

    const response = new SuccessResponse({success: true});
    return response.getResponse();
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    const exception = new InternalServerException(error);
    return exception.getResponse();
  }
});

export default router;

