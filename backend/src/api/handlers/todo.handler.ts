import { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { TodoService } from '../../core/services/todo.service';
import { BaseHandler } from './base.handler';
import { createTodoSchema, updateTodoSchema, todoFilterSchema } from '../../shared/types/todo';
import { paginationSchema } from '../../shared/types/common';

export class TodoHandler extends BaseHandler {
  constructor(private todoService: TodoService) {
    super();
  }

  getAllTodos = zValidator('query', todoFilterSchema.merge(paginationSchema), async (result, c) => {
    this.handleZodError(result, c);

    const userId = this.getUserId(c);
    const { limit, offset, sortBy, sortOrder, ...filters } = result.data;
    const response = await this.todoService.getAllTodos(userId, filters, { limit, offset, sortBy, sortOrder });
    return this.success(c, response, 'Todos retrieved successfully');
  });

  getTodoById = async (c: Context) => {
    const userId = this.getUserId(c);
    const id = (c.req.param as any)('id') as string;
    const todo = await this.todoService.getTodoById(id, userId);
    return this.success(c, todo, 'Todo retrieved successfully');
  };

  createTodo = zValidator('json', createTodoSchema, async (result, c) => {
    this.handleZodError(result, c);

    const userId = this.getUserId(c);
    const todo = await this.todoService.createTodo(result.data, userId);
    return this.created(c, todo, 'Todo created successfully');
  });

  updateTodo = zValidator('json', updateTodoSchema, async (result, c) => {
    this.handleZodError(result, c);

    const userId = this.getUserId(c);
    const id = (c.req.param as any)('id') as string;
    const todo = await this.todoService.updateTodo(id, result.data, userId);
    return this.success(c, todo, 'Todo updated successfully');
  });

  deleteTodo = async (c: Context) => {
    const userId = this.getUserId(c);
    const id = (c.req.param as any)('id') as string;
    await this.todoService.deleteTodo(id, userId);
    return this.noContent(c, 'Todo deleted successfully');
  };
}
