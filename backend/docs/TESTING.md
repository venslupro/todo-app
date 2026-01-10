# Testing Guide

## Table of Contents
- [Overview](#overview)
- [Testing Framework](#-testing-framework)
- [Running Tests](#-running-tests)
- [Writing Tests](#-writing-tests)
- [Test Setup](#-test-setup)
- [Coverage Reports](#-coverage-reports)
- [Common Testing Issues](#-common-testing-issues)
- [CI/CD Integration](#-cicd-integration)
- [Best Practices](#-best-practices)

## Overview

This guide covers the testing framework and practices used in the Todo App Backend project. The project uses Jest as the testing framework with TypeScript support.

## 🧪 Testing Framework

### Dependencies
- **Jest**: JavaScript testing framework
- **@types/jest**: TypeScript definitions for Jest
- **ts-jest**: TypeScript preprocessor for Jest

### Configuration
Jest configuration is defined in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/__tests__/validator.test.ts
```

### Test Scripts
Available scripts in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 📝 Writing Tests

### Test File Structure

Test files should be placed in `__tests__` directories or use `.test.ts`/`.spec.ts` suffix.

```typescript
// src/__tests__/validator.test.ts
import { validateTodo } from '../shared/validation/validator';

describe('Todo Validator', () => {
  describe('validateTodo', () => {
    it('should validate a valid todo', () => {
      const validTodo = {
        title: 'Test Todo',
        description: 'Test description',
        status: 'pending'
      };
      
      const result = validateTodo(validTodo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject a todo without title', () => {
      const invalidTodo = {
        description: 'Test description'
      };
      
      const result = validateTodo(invalidTodo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });
  });
});
```

### Testing Patterns

#### 1. Unit Testing
Test individual functions and modules:

```typescript
// Testing service functions
import { TodoService } from '../core/services/todo-service';

describe('TodoService', () => {
  let todoService: TodoService;
  
  beforeEach(() => {
    todoService = new TodoService();
  });

  it('should create a todo', async () => {
    const todoData = { title: 'Test Todo' };
    const result = await todoService.create(todoData);
    
    expect(result.title).toBe('Test Todo');
    expect(result.id).toBeDefined();
  });
});
```

#### 2. API Endpoint Testing
Test HTTP handlers:

```typescript
// Testing API handlers
import { createTodoHandler } from '../api/handlers/todo';

describe('Todo Handlers', () => {
  it('should handle todo creation', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ title: 'Test Todo' })
    };
    
    const response = await createTodoHandler(mockRequest);
    
    expect(response.status).toBe(201);
    expect(await response.json()).toHaveProperty('id');
  });
});
```

#### 3. Validation Testing
Test validation logic:

```typescript
// Testing validation functions
import { validateEmail, validatePassword } from '../shared/validation/validator';

describe('Validation', () => {
  it('should validate email format', () => {
    expect(validateEmail('valid@email.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should validate password strength', () => {
    expect(validatePassword('StrongPass123!')).toBe(true);
    expect(validatePassword('weak')).toBe(false);
  });
});
```

## 🔧 Test Setup

### Environment Setup
Create a test environment file `.env.test`:

```env
NODE_ENV=test
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_ANON_KEY=test-anon-key
JWT_SECRET=test-jwt-secret
```

### Mocking Dependencies

#### Mocking Supabase Client
```typescript
// src/__tests__/mocks/supabase.ts
import { SupabaseClient } from '@supabase/supabase-js';

export const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  data: []
} as unknown as SupabaseClient;
```

#### Mocking External Services
```typescript
// Mock external API calls
jest.mock('../core/services/external-service', () => ({
  ExternalService: jest.fn().mockImplementation(() => ({
    fetchData: jest.fn().mockResolvedValue({ success: true })
  }))
}));
```

## 📊 Coverage Reports

### Generating Reports
Run tests with coverage to generate reports:

```bash
npm run test:coverage
```

### Coverage Configuration
Configure coverage thresholds in `jest.config.js`:

```javascript
module.exports = {
  // ... other config
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Coverage Reports
- **HTML Report**: `coverage/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Text Report**: Console output

## 🚨 Common Testing Issues

### 1. TypeScript Configuration
Ensure `tsconfig.json` includes test files:

```json
{
  "include": ["src/**/*", "src/__tests__/**/*"]
}
```

### 2. Environment Variables
Use different environment variables for testing:

```typescript
// In test setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
```

### 3. Async Testing
Handle asynchronous operations properly:

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## 🔄 CI/CD Integration

### GitHub Actions
Tests are automatically run in CI:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## 📝 Best Practices

1. **Write Descriptive Test Names**: Use `describe` and `it` blocks effectively
2. **Keep Tests Isolated**: Each test should be independent
3. **Use Mocks Appropriately**: Mock external dependencies
4. **Test Edge Cases**: Include boundary conditions and error cases
5. **Maintain Test Coverage**: Aim for 80%+ coverage
6. **Run Tests Frequently**: Integrate with development workflow

## 🔗 Related Documentation

- [Project Overview](PROJECT_SUMMARY.md)
- [API Documentation](API.md)
- [Environment Configuration](ENVIRONMENT.md)