// api/middleware/auth.ts
import {Context, Next} from 'hono';
import {HttpErrors} from '../../shared/errors/http-errors';
import {AuthService} from '../../core/services/auth-service';

/**
 * 认证中间件
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpErrors.UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // 使用认证服务验证令牌
    const authService = new AuthService(c.env);
    const user = await authService.verifyToken(token);

    // 将用户信息添加到上下文
    c.set('user', user);

    await next();
  } catch (error) {
    if (error instanceof HttpErrors.UnauthorizedError) {
      throw error;
    }
    console.error('Auth middleware error:', error);
    throw new HttpErrors.UnauthorizedError('Authentication failed');
  }
};
