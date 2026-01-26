// src/api/handlers/todo.ts
// Todo API handlers for todo management

import {Context} from 'hono';
import {TodoService} from '../../core/services/todo';
import {
  ValidationException,
  NotFoundException,
  InternalServerException,
  SuccessResponse,
} from '../../shared/errors/http-exception';
import {
  createTodoSchema,
  updateTodoSchema,
  todoFilterSchema,
} from '../../shared/schemas';
import {getUserIdFromContext} from '../../shared/utils';

interface TodoHandlerOptions {
  todoService: TodoService;
}

export class TodoHandler {
  private readonly todoService: TodoService;

  constructor(options: TodoHandlerOptions) {
    this.todoService = options.todoService;
  }

  /**
   * Get all todos with filtering options
   */
  async getAllTodos(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Extract and validate query parameters
      const validated = todoFilterSchema.safeParse(c.req.query());
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to get todos
      const result = await this.todoService.getTodos(userId, validated.data);

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      const success = new SuccessResponse(result.value);
      return success.getResponse();
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Validate request body
      const body = await c.req.json();
      const validated = createTodoSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to create todo
      const result = await this.todoService.createTodo({
        ...validated.data,
        created_by: userId,
      });

      if (result.isErr()) {
        // Check if the error is about an invalid parent_id
        if (result.error.message.includes('Invalid parent_id')) {
          throw new ValidationException(result.error.message);
        }
        throw new InternalServerException(result.error.message);
      }

      const success = new SuccessResponse(result.value);
      return success.getResponse();
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }

  /**
   * Get a todo by ID
   */
  async getTodoById(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Get todo ID from path parameters
      const todoId = c.req.param('id');
      if (!todoId) {
        throw new ValidationException('Todo ID is required');
      }

      // Call service to get todo
      const result = await this.todoService.getTodoById(todoId, userId);

      if (result.isErr()) {
        throw new NotFoundException(result.error.message);
      }

      const success = new SuccessResponse(result.value);
      return success.getResponse();
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Get todo ID from path parameters
      const todoId = c.req.param('id');
      if (!todoId) {
        throw new ValidationException('Todo ID is required');
      }

      // Validate request body
      const body = await c.req.json();
      const validated = updateTodoSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to update todo
      const result = await this.todoService.updateTodo(todoId, userId, validated.data);

      if (result.isErr()) {
        // Check if the error is about an invalid parent_id or todo_id
        const errorMessage = result.error.message;
        if (
          errorMessage.includes('Invalid parent_id') ||
          errorMessage.includes('Invalid todo_id')
        ) {
          throw new ValidationException(result.error.message);
        }
        throw new NotFoundException(result.error.message);
      }

      const success = new SuccessResponse(result.value);
      return success.getResponse();
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Get todo ID from path parameters
      const todoId = c.req.param('id');
      if (!todoId) {
        throw new ValidationException('Todo ID is required');
      }

      // Call service to delete todo
      const result = await this.todoService.deleteTodo(todoId, userId);

      if (result.isErr()) {
        throw new NotFoundException(result.error.message);
      }

      const success = new SuccessResponse({message: 'TODO deleted successfully'});
      return success.getResponse();
    } catch (error) {
      if (error instanceof ValidationException ||
          error instanceof NotFoundException ||
          error instanceof InternalServerException) {
        throw error;
      }
      throw new InternalServerException(
        (error as Error).message,
      );
    }
  }
}

export const createTodoHandler = (options: TodoHandlerOptions): TodoHandler => {
  return new TodoHandler(options);
};
