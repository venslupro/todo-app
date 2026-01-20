// src/services/auth.ts
// Authentication service for handling auth-related business logic

import {Result, err, ok} from 'neverthrow';
import {AuthDriver} from '../drivers/auth';
import {AuthResponse, User} from '../models/types';
import {appLogger as logger} from '../../shared/utils/logger';

interface AuthServiceOptions {
  authDriver: AuthDriver;
}

export class AuthService {
  private readonly authDriver: AuthDriver;

  constructor(options: AuthServiceOptions) {
    this.authDriver = options.authDriver;
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    username?: string,
    // eslint-disable-next-line camelcase
    full_name?: string,
  ): Promise<Result<AuthResponse, Error>> {
    try {
      logger.debug('Registering new user', {email, username});

      // Call driver to register user
      const result = await this.authDriver.register(email, password, username, full_name);

      if (result.isErr()) {
        logger.error('Registration failed', {email, error: result.error.message});
        return err(new Error(`Registration failed: ${result.error.message}`));
      }

      logger.info('User registered successfully', {userId: result.value.user.id, email});
      return ok(result.value);
    } catch (error) {
      logger.error('Registration error', {email, error: (error as Error).message});
      return err(new Error(`Registration error: ${(error as Error).message}`));
    }
  }

  /**
   * Login a user
   */
  async login(
    email: string,
    password: string,
  ): Promise<Result<AuthResponse, Error>> {
    try {
      logger.debug('User login attempt', {email});

      // Call driver to login user
      const result = await this.authDriver.login(email, password);

      if (result.isErr()) {
        logger.error('Login failed', {email, error: result.error.message});
        return err(new Error(`Login failed: ${result.error.message}`));
      }

      logger.info('User logged in successfully', {userId: result.value.user.id, email});
      return ok(result.value);
    } catch (error) {
      logger.error('Login error', {email, error: (error as Error).message});
      return err(new Error(`Login error: ${(error as Error).message}`));
    }
  }

  /**
   * Refresh a user's session
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<Result<AuthResponse, Error>> {
    try {
      logger.debug('Token refresh attempt');

      // Call driver to refresh token
      const result = await this.authDriver.refreshToken(refreshToken);

      if (result.isErr()) {
        logger.error('Token refresh failed', {error: result.error.message});
        return err(new Error(`Token refresh failed: ${result.error.message}`));
      }

      logger.info('Token refreshed successfully', {userId: result.value.user.id});
      return ok(result.value);
    } catch (error) {
      logger.error('Token refresh error', {error: (error as Error).message});
      return err(new Error(`Token refresh error: ${(error as Error).message}`));
    }
  }

  /**
   * Logout a user
   */
  async logout(accessToken: string): Promise<Result<boolean, Error>> {
    try {
      logger.debug('User logout attempt');

      // Call driver to logout user
      const result = await this.authDriver.logout(accessToken);

      if (result.isErr()) {
        logger.error('Logout failed', {error: result.error.message});
        return err(new Error(`Logout failed: ${result.error.message}`));
      }

      logger.info('User logged out successfully');
      return ok(result.value);
    } catch (error) {
      logger.error('Logout error', {error: (error as Error).message});
      return err(new Error(`Logout error: ${(error as Error).message}`));
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<Result<User, Error>> {
    try {
      logger.debug('Get user profile', {userId});

      // Call driver to get profile
      const result = await this.authDriver.getProfile(userId);

      if (result.isErr()) {
        logger.error('Get profile failed', {userId, error: result.error.message});
        return err(new Error(`Get profile failed: ${result.error.message}`));
      }

      logger.info('User profile retrieved successfully', {userId});
      return ok(result.value);
    } catch (error) {
      logger.error('Get profile error', {userId, error: (error as Error).message});
      return err(new Error(`Get profile error: ${(error as Error).message}`));
    }
  }
}

export const createAuthService = (options: AuthServiceOptions): AuthService => {
  return new AuthService(options);
};
