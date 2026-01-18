import { Context, Next } from 'hono';

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    console.error('Error:', error);
    
    if (error.code && error.message) {
      return c.json({ error: error.message, details: error.details }, error.code);
    }
    
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};