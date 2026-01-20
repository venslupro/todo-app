// src/utils/index.ts
// Utility functions for the application

import {Context} from 'hono';
import {ValidationException} from '../errors/http-exception';

/**
 * Get user ID from context
 * @param c - Hono context
 * @returns User ID as string
 * @throws ValidationException if user ID is not found in context
 */
export const getUserIdFromContext = (c: Context): string => {
  const userId = c.get('userId');
  if (!userId || typeof userId !== 'string') {
    throw new ValidationException('User ID not found in context');
  }
  return userId;
};

/**
 * Extract and parse pagination options from query parameters
 * @param c - Hono context
 * @returns Pagination options with default values
 */
export const getPaginationOptions = (c: Context) => {
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit') as string) : 50;
  const offset = c.req.query('offset') ? parseInt(c.req.query('offset') as string) : 0;
  return {limit, offset};
};
