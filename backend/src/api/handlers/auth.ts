// src/api/handlers/auth.ts
// Authentication API handlers

import {Context} from 'hono';
import {AuthService} from '../../core/services/auth';
import {
  ValidationException,
  InternalServerException,
  SuccessResponse,
  UnauthorizedException,
} from '../../shared/errors/http-exception';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from '../../shared/schemas';
import {getUserIdFromContext} from '../../shared/utils';

interface AuthHandlerOptions {
  authService: AuthService;
}

export class AuthHandler {
  private readonly authService: AuthService;

  constructor(options: AuthHandlerOptions) {
    this.authService = options.authService;
  }

  /**
   * Register a new user
   */
  async register(c: Context) {
    try {
      // Validate request body
      const body = await c.req.json();
      const validated = registerSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to register user
      const result = await this.authService.register(
        validated.data.email,
        validated.data.password,
        validated.data.username,
        validated.data.full_name,
      );

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      throw new SuccessResponse(result.value);
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerException ||
        error instanceof SuccessResponse
      ) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }

  /**
   * Login a user
   */
  async login(c: Context) {
    try {
      // Validate request body
      const body = await c.req.json();
      const validated = loginSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to login user
      const result = await this.authService.login(
        validated.data.email,
        validated.data.password,
      );

      if (result.isErr()) {
        throw new UnauthorizedException(result.error.message);
      }

      throw new SuccessResponse(result.value);
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerException ||
        error instanceof SuccessResponse
      ) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }

  /**
   * Refresh a user's session
   */
  async refresh(c: Context) {
    try {
      // Validate request body
      const body = await c.req.json();
      const validated = refreshTokenSchema.safeParse(body);
      if (!validated.success) {
        throw new ValidationException(validated.error.errors);
      }

      // Call service to refresh token
      const result = await this.authService.refreshToken(validated.data.refresh_token);

      if (result.isErr()) {
        throw new UnauthorizedException(result.error.message);
      }

      throw new SuccessResponse(result.value);
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerException ||
        error instanceof SuccessResponse
      ) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }

  /**
   * Logout a user
   */
  async logout(c: Context) {
    try {
      // Get access token from headers
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.split(' ')[1] || '';

      // Call service to logout user
      const result = await this.authService.logout(token);

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      throw new SuccessResponse({message: 'Logged out successfully'});
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerException ||
        error instanceof SuccessResponse
      ) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }

  /**
   * Get current user profile
   */
  async profile(c: Context) {
    try {
      // Get user ID from context
      const userId = getUserIdFromContext(c);

      // Call service to get profile
      const result = await this.authService.getProfile(userId);

      if (result.isErr()) {
        throw new InternalServerException(result.error.message);
      }

      throw new SuccessResponse(result.value);
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerException ||
        error instanceof SuccessResponse
      ) {
        throw error;
      }
      throw new InternalServerException((error as Error).message);
    }
  }
}

export const createAuthHandler = (options: AuthHandlerOptions): AuthHandler => {
  return new AuthHandler(options);
};
