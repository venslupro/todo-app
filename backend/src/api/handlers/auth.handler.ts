import { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AuthService } from '../../core/services/auth.service';
import { BaseHandler } from './base.handler';
import { registerSchema, loginSchema, refreshTokenSchema } from '../../shared/types/auth';

export class AuthHandler extends BaseHandler {
  constructor(private authService: AuthService) {
    super();
  }

  register = zValidator('json', registerSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const response = await this.authService.register(result.data);
      return this.created(c, response);
    } catch (error: any) {
      if (error.message.includes('invalid credentials') || error.message.includes('auth')) {
        return this.unauthorized(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  });

  login = zValidator('json', loginSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const response = await this.authService.login(result.data);
      return this.success(c, response);
    } catch (error: any) {
      if (error.message.includes('invalid credentials') || error.message.includes('auth')) {
        return this.unauthorized(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  });

  refreshToken = zValidator('json', refreshTokenSchema, async (result, c) => {
    const errorResponse = this.handleZodError(result, c);
    if (errorResponse) return errorResponse;

    try {
      const response = await this.authService.refreshToken(result.data);
      return this.success(c, response);
    } catch (error: any) {
      if (error.message.includes('token') || error.message.includes('auth')) {
        return this.unauthorized(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  });

  logout = async (c: Context) => {
    try {
      const accessToken = this.getAccessToken(c);
      await this.authService.logout(accessToken);
      return this.noContent(c);
    } catch (error: any) {
      return this.internalError(c, error.message);
    }
  };

  getProfile = async (c: Context) => {
    try {
      const accessToken = this.getAccessToken(c);
      const user = await this.authService.getCurrentUser(accessToken);
      return this.success(c, user);
    } catch (error: any) {
      if (error.message.includes('token') || error.message.includes('auth')) {
        return this.unauthorized(c, error.message);
      }
      return this.internalError(c, error.message);
    }
  };
}