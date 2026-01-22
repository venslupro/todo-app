// src/__tests__/schemas.test.ts
// Tests for Zod validation schemas

import {z} from 'zod';
import {createTodoSchema, updateTodoSchema, loginSchema, registerSchema} from '../shared/schemas';

describe('Zod Schemas', () => {
  describe('createTodoSchema', () => {
    it('should validate correct todo creation data', () => {
      const validData = {
        name: 'Test Todo',
        description: 'Test Description',
        status: 'not_started',
        due_date: '2024-12-31T23:59:59Z',
        priority: 'medium',
      };

      const result = createTodoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const invalidData = {
        description: 'Test Description',
        status: 'pending',
      };

      const result = createTodoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid status values', () => {
      const invalidData = {
        title: 'Test Todo',
        status: 'invalid-status',
      };

      const result = createTodoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTodoSchema', () => {
    it('should validate correct todo update data', () => {
      const validData = {
        title: 'Updated Todo',
        status: 'completed',
      };

      const result = updateTodoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates', () => {
      const validData = {
        priority: 'high',
      };

      const result = updateTodoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid priority values', () => {
      const invalidData = {
        priority: 'invalid-priority',
      };

      const result = updateTodoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('auth schemas', () => {
    describe('registerSchema', () => {
      it('should validate correct registration data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        };

        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should fail validation for weak passwords', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should fail validation for invalid email formats', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User',
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
        };

        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should fail validation for missing required fields', () => {
        const invalidData = {
          email: 'test@example.com',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });
});
