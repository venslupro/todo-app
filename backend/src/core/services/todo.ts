// src/services/todo.ts
// Todo service for handling todo-related business logic

import {Result, err, ok} from 'neverthrow';
import {TodoDriver} from '../drivers/todo';
import {TeamDriver} from '../drivers/team';
import {Todo, TodoFilterOptions} from '../models/types';

interface TodoServiceOptions {
  todoDriver: TodoDriver;
  teamDriver: TeamDriver;
}

export class TodoService {
  private readonly todoDriver: TodoDriver;
  private readonly teamDriver: TeamDriver;

  constructor(options: TodoServiceOptions) {
    this.todoDriver = options.todoDriver;
    this.teamDriver = options.teamDriver;
  }

  /**
   * Create a new todo
   */
  async createTodo(
    data: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>,
  ): Promise<Result<Todo, Error>> {
    try {
      // If parent_id is provided, check if it exists and the user has permission
      if (data.parent_id) {
        const permissionResult = await this.teamDriver.checkTodoPermission(
          data.parent_id,
          data.created_by,
          'edit',
        );

        if (permissionResult.isErr() || !permissionResult.value) {
          return err(new Error('Permission denied: Cannot create subtask for this todo'));
        }
      }

      // Call driver to create todo
      const result = await this.todoDriver.createTodo(data);

      if (result.isErr()) {
        return err(new Error(`Create todo failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Create todo error: ${(error as Error).message}`));
    }
  }

  /**
   * Get a todo by ID
   */
  async getTodoById(
    todoId: string,
    userId: string,
  ): Promise<Result<Todo, Error>> {
    try {
      // Check if user has permission to access the todo
      const permissionResult = await this.teamDriver.checkTodoPermission(
        todoId,
        userId,
      );

      if (permissionResult.isErr() || !permissionResult.value) {
        return err(new Error('Permission denied: Cannot access this todo'));
      }

      // Call driver to get todo
      const result = await this.todoDriver.getTodoById(todoId);

      if (result.isErr()) {
        return err(new Error(`Get todo failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Get todo error: ${(error as Error).message}`));
    }
  }

  /**
   * Get all todos with filtering options
   */
  async getTodos(
    userId: string,
    filters: TodoFilterOptions = {},
  ): Promise<Result<{ todos: Todo[]; total: number }, Error>> {
    try {
      // Call driver to get todos
      const result = await this.todoDriver.getTodos(userId, filters);

      if (result.isErr()) {
        return err(new Error(`Get todos failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Get todos error: ${(error as Error).message}`));
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(
    todoId: string,
    userId: string,
    data: Partial<Omit<Todo, 'id' | 'created_by' | 'created_at' | 'is_deleted'>>,
  ): Promise<Result<Todo, Error>> {
    try {
      // Check if user has edit permission
      const permissionResult = await this.teamDriver.checkTodoPermission(
        todoId,
        userId,
        'edit',
      );

      if (permissionResult.isErr() || !permissionResult.value) {
        return err(new Error('Permission denied: Cannot update this todo'));
      }

      // If parent_id is provided, check if it exists and the user has permission
      if (data.parent_id) {
        const parentPermissionResult = await this.teamDriver.checkTodoPermission(
          data.parent_id,
          userId,
          'edit',
        );

        if (parentPermissionResult.isErr() || !parentPermissionResult.value) {
          return err(new Error('Permission denied: Cannot assign to this parent todo'));
        }
      }

      // Call driver to update todo
      const result = await this.todoDriver.updateTodo(todoId, data);

      if (result.isErr()) {
        return err(new Error(`Update todo failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Update todo error: ${(error as Error).message}`));
    }
  }

  /**
   * Delete a todo (soft delete)
   */
  async deleteTodo(
    todoId: string,
    userId: string,
  ): Promise<Result<boolean, Error>> {
    try {
      // Check if user has edit permission
      const permissionResult = await this.teamDriver.checkTodoPermission(
        todoId,
        userId,
        'edit',
      );

      if (permissionResult.isErr() || !permissionResult.value) {
        return err(new Error('Permission denied: Cannot delete this todo'));
      }

      // Call driver to delete todo
      const result = await this.todoDriver.deleteTodo(todoId);

      if (result.isErr()) {
        return err(new Error(`Delete todo failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Delete todo error: ${(error as Error).message}`));
    }
  }
}

export const createTodoService = (options: TodoServiceOptions): TodoService => {
  return new TodoService(options);
};
