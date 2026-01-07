import { Context } from 'hono';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export async function auth(c: Context, next: Function) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization token'
    }, 401);
  }
  
  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as UserPayload;
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    }, 401);
  }
}