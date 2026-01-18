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
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const userId = this.getUserId(c);
      const { limit, offset, sortBy, sortOrder, ...filters } = result.data;
      const response = await this.todoService.getAllTodos(userId, filters, { limit, offset, sortBy, sortOrder });
      return this.success(c, response);
    } catch (error: any) {
      return this.internalError(c, error.message);
    }
  });

  getTodoById = async (c: Context) => {
    try {
      const userId = this.getUserId(c);
      const id = (c.req.param as any)('id') as string;
      const todo = await this.todoService.getTodoById(id, userId);
      return this.success(c, todo);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return this.notFound(c, 'TODO not found');
      }
      return this.internalError(c, error.message);
    }
  };

  createTodo = zValidator('json', createTodoSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const userId = this.getUserId(c);
      const todo = await this.todoService.createTodo(result.data, userId);
      return this.created(c, todo);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return this.conflict(c, error.message);
      }
      if (error.message.includes('Invalid')) {
        return this.badRequest(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  });

  updateTodo = zValidator('json', updateTodoSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const userId = this.getUserId(c);
      const id = (c.req.param as any)('id') as string;
      const todo = await this.todoService.updateTodo(id, result.data, userId);
      return this.success(c, todo);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return this.notFound(c, 'TODO not found');
      }
      if (error.message.includes('Invalid')) {
        return this.badRequest(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  });

  deleteTodo = async (c: Context) => {
    try {
      const userId = this.getUserId(c);
      const id = (c.req.param as any)('id') as string;
      await this.todoService.deleteTodo(id, userId);
      return this.noContent(c);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return this.notFound(c, 'TODO not found');
      }
      return this.internalError(c, error.message);
    }
  };
}