# Testing Guide

This guide covers testing practices for the Todo App Backend.

## Testing Framework

- **Jest**: JavaScript testing framework
- **ts-jest**: TypeScript support for Jest
- **@types/jest**: Type definitions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Test File Structure

Test files should be placed in `__tests__` directories or use `.test.ts` suffix.

```typescript
// src/__tests__/todo.test.ts
import { TodoService } from '../core/services/todo-service';

describe('TodoService', () => {
  let todoService: TodoService;
  
  beforeEach(() => {
    todoService = new TodoService({} as any);
  });

  it('should create a todo', async () => {
    const todoData = { name: 'Test Todo' };
    const result = await todoService.createTodo('user-id', todoData);
    
    expect(result.name).toBe('Test Todo');
    expect(result.id).toBeDefined();
  });
});
```

### Testing Patterns

#### Unit Testing
Test individual functions and services:

```typescript
// Testing validation functions
import { validateTodo } from '../shared/validation/validator';

describe('Todo Validation', () => {
  it('should validate a valid todo', () => {
    const validTodo = { name: 'Test Todo', status: 'not_started' };
    const result = validateTodo(validTodo);
    
    expect(result.isValid).toBe(true);
  });

  it('should reject a todo without name', () => {
    const invalidTodo = { status: 'not_started' };
    const result = validateTodo(invalidTodo);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });
});
```

#### API Handler Testing
Test HTTP route handlers:

```typescript
// Testing API handlers
import { createTodoHandler } from '../api/handlers/todo';

describe('Todo Handlers', () => {
  it('should handle todo creation', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ name: 'Test Todo' }),
      header: jest.fn().mockReturnValue('Bearer token')
    };
    
    const response = await createTodoHandler(mockRequest as any);
    
    expect(response.status).toBe(201);
    expect(await response.json()).toHaveProperty('id');
  });
});
```

## Test Setup

### Environment Variables
Create `.env.test` for test environment:

```env
NODE_ENV=test
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_ANON_KEY=test-anon-key

```

### Mocking Dependencies

Mock external dependencies like database clients:

```typescript
// src/__tests__/mocks/supabase.ts
export const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
};
```

## Coverage Reports

Coverage reports are generated in `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format

## Best Practices

- Write tests for all new features
- Keep tests focused and independent
- Use descriptive test names
- Mock external dependencies
- Test both success and error cases
- Maintain high test coverage