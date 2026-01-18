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
    this.handleZodError(result, c);

    const response = await this.authService.register(result.data);
    return this.created(c, response, 'User registered successfully');
  });

  login = zValidator('json', loginSchema, async (result, c) => {
    this.handleZodError(result, c);

    const response = await this.authService.login(result.data);
    return this.success(c, response, 'Login successful');
  });

  refreshToken = zValidator('json', refreshTokenSchema, async (result, c) => {
    this.handleZodError(result, c);

    const response = await this.authService.refreshToken(result.data);
    return this.success(c, response, 'Token refreshed successfully');
  });

  logout = async (c: Context) => {
    const accessToken = this.getAccessToken(c);
    await this.authService.logout(accessToken);
    return this.noContent(c, 'Logout successful');
  };

  getProfile = async (c: Context) => {
    const accessToken = this.getAccessToken(c);
    const user = await this.authService.getCurrentUser(accessToken);
    return this.success(c, user, 'Profile retrieved successfully');
  };
}
