import {Hono} from 'hono';
import {HonoAppType} from '../../shared/types/hono-types';
import {HttpErrors} from '../../shared/errors/http-errors';
import {TodoService} from '../../core/services/todo-service';
import {AppConfig} from '../../shared/config/config';
import {
  TodoStatus,
  TodoPriority,
} from '../../core/models/todo';

const router = new Hono<HonoAppType>();

/**
 * Creates a TODO service instance.
 */
function createTodoService(c: {env: Record<string, unknown>}): TodoService {
  const config = new AppConfig(c.env);
  return new TodoService(config);
}

/**
 * Gets TODO list.
 * GET /api/v1/todos
 */
router.get('/', async (c) => {
  const user = c.get('user');
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
    sort_by: validSortBy.includes(sortBy || '') ? sortBy as 'name' | 'priority' | 'due_date' | 'created_at' | 'updated_at' : undefined,
    sort_order: query['sort_order'] as 'asc' | 'desc',
  };

  const todoService = createTodoService(c);
  const result = await todoService.getTodos(user.id, params);

  return c.json(new HttpErrors.OkResponse(result));
});

/**
 * 创建TODO
 * POST /api/v1/todos
 */
router.post('/', async (c) => {
  const user = c.get('user') as any;
  const body = await c.req.json();

  const todoService = createTodoService(c);
  const todo = await todoService.createTodo(user.id, body);

  return c.json(new HttpErrors.OkResponse(todo), 201);
});

/**
 * 获取单个TODO
 * GET /api/v1/todos/:id
 */
router.get('/:id', async (c) => {
  const user = c.get('user') as any;
  const todoId = c.req.param('id');

  const todoService = createTodoService(c);
  const todo = await todoService.getTodo(todoId, user.id);

  return c.json(new HttpErrors.OkResponse(todo));
});

/**
 * 更新TODO
 * PUT /api/v1/todos/:id
 */
router.put('/:id', async (c) => {
  const user = c.get('user') as any;
  const todoId = c.req.param('id');
  const body = await c.req.json();

  const todoService = createTodoService(c);
  const todo = await todoService.updateTodo(todoId, user.id, body);

  return c.json(new HttpErrors.OkResponse(todo));
});

/**
 * 删除TODO
 * DELETE /api/v1/todos/:id
 */
router.delete('/:id', async (c) => {
  const user = c.get('user') as any;
  const todoId = c.req.param('id');

  const todoService = createTodoService(c);
  await todoService.deleteTodo(todoId, user.id);

  return c.json(new HttpErrors.OkResponse({success: true}));
});

export default router;
