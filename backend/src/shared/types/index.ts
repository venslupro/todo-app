// backend/src/lib/middleware.ts
import {Context, Next} from 'hono';
import {HttpErrors} from '../errors/http-errors';
import {SupabaseClient} from './supabase';

/**
 * 认证中间件
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpErrors.UnauthorizedError('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const env = c.env as any;
  
  try {
    // 验证JWT令牌
    const supabase = SupabaseClient.getClient(env);
    const {data: {user}, error} = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new HttpErrors.UnauthorizedError('Invalid or expired token');
    }
    
    // 将用户信息添加到上下文
    c.set('user', user);
    
    await next();
  } catch (error) {
    if (error instanceof HttpErrors.UnauthorizedError) {
      throw error;
    }
    throw new HttpErrors.UnauthorizedError('Authentication failed');
  }
};

/**
 * 错误处理中间件
 */
export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof Error && 'statusCode' in error && 'code' in error) {
      // 这是我们定义的错误类型
      const customError = error as any;
      return c.json(
        {
          error: {
            code: customError.code,
            message: customError.message,
            details: customError.details,
          },
        },
        customError.statusCode || 500,
      );
    }
    
    // 未知错误
    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      500,
    );
  }
};

/**
 * CORS中间件
 */
export const corsMiddleware = async (c: Context, next: Next) => {
  // 预检请求处理
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  await next();
  
  // 添加CORS头
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
};

/**
 * 请求日志中间件
 */
export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  console.log(`${method} ${url} - ${status} (${duration}ms)`);
};

/**
 * 速率限制中间件
 */
export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const env = c.env as any;
  
  // 使用Cloudflare KV进行速率限制
  const kv = env.KV_STORE;
  const key = `rate_limit:${ip}`;
  const limit = 100; // 每分钟100次请求
  const windowMs = 60 * 1000; // 1分钟
  
  const current = await kv.get(key);
  const currentCount = current ? parseInt(current) : 0;
  
  if (currentCount >= limit) {
    throw new HttpErrors.RateLimitError('Rate limit exceeded');
  }
  
  // 增加计数
  await kv.put(key, (currentCount + 1).toString(), {
    expirationTtl: Math.ceil(windowMs / 1000),
  });
  
  // 添加速率限制头
  c.header('X-RateLimit-Limit', limit.toString());
  c.header('X-RateLimit-Remaining', (limit - currentCount - 1).toString());
  c.header('X-RateLimit-Reset', (Date.now() + windowMs).toString());
  
  await next();
};