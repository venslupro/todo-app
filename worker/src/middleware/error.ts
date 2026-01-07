import { Context } from 'hono';

export async function errorHandler(c: Context, next: Function) {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    
    return c.json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }, 500);
  }
}