// src/drivers/auth.ts
// Authentication driver for handling user authentication operations

import {Result, err, ok} from 'neverthrow';
import {SupabaseDriver} from './supabase/supabase';
import {AuthResponse, User} from '../models/types';
import {Logger} from '../../shared/utils/logger';

interface AuthDriverOptions {
  supabase: SupabaseDriver;
  logger: Logger;
}

export class AuthDriver {
  private readonly supabase: SupabaseDriver;
  private readonly logger: Logger;

  constructor(options: AuthDriverOptions) {
    this.supabase = options.supabase;
    this.logger = options.logger;
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
      this.logger.debug('AuthDriver: Registering new user', {email, username});
      const {data, error} = await this.supabase.getAnonClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            // eslint-disable-next-line camelcase
            full_name,
            role: 'user',
          },
        },
      });

      if (error) {
        this.logger.error('AuthDriver: Registration failed', {email, error: error.message});
        return err(new Error(`Auth registration failed: ${error.message}`));
      }

      if (!data.user || !data.session) {
        this.logger.error('AuthDriver: Registration failed - no user or session', {email});
        return err(new Error('Auth registration failed: User or session not created'));
      }

      this.logger.debug('AuthDriver: User registered successfully', {userId: data.user.id, email});
      return ok({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          username: data.user.user_metadata.username as string | undefined,
          full_name: data.user.user_metadata.full_name as string | undefined,
          avatar_url: data.user.user_metadata.avatar_url as string | undefined | null,
          role: data.user.user_metadata.role as 'user' | 'admin',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || '',
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
      });
    } catch (error) {
      this.logger.error('AuthDriver: Registration error', {email, error: (error as Error).message});
      return err(new Error(`Auth registration error: ${(error as Error).message}`));
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
      this.logger.debug('AuthDriver: User login attempt', {email});
      const {data, error} = await this.supabase.getAnonClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error('AuthDriver: Login failed', {email, error: error.message});
        return err(new Error(`Auth login failed: ${error.message}`));
      }

      if (!data.user || !data.session) {
        this.logger.error('AuthDriver: Login failed - no user or session', {email});
        return err(new Error('Auth login failed: User or session not found'));
      }

      this.logger.debug('AuthDriver: User logged in successfully', {userId: data.user.id, email});
      return ok({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          username: data.user.user_metadata.username as string | undefined,
          full_name: data.user.user_metadata.full_name as string | undefined,
          avatar_url: data.user.user_metadata.avatar_url as string | undefined | null,
          role: data.user.user_metadata.role as 'user' | 'admin',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || '',
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
      });
    } catch (error) {
      this.logger.error('AuthDriver: Login error', {email, error: (error as Error).message});
      return err(new Error(`Auth login error: ${(error as Error).message}`));
    }
  }

  /**
   * Refresh a user's session
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<Result<AuthResponse, Error>> {
    try {
      this.logger.debug('AuthDriver: Refreshing token');
      const {data, error} = await this.supabase.getAnonClient().auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        this.logger.error('AuthDriver: Token refresh failed', {error: error.message});
        return err(new Error(`Auth refresh failed: ${error.message}`));
      }

      if (!data.user || !data.session) {
        this.logger.error('AuthDriver: Token refresh failed - no user or session');
        return err(new Error('Auth refresh failed: User or session not found'));
      }

      this.logger.debug('AuthDriver: Token refreshed successfully', {userId: data.user.id});
      return ok({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          username: data.user.user_metadata.username as string | undefined,
          full_name: data.user.user_metadata.full_name as string | undefined,
          avatar_url: data.user.user_metadata.avatar_url as string | undefined | null,
          role: data.user.user_metadata.role as 'user' | 'admin',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || '',
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
      });
    } catch (error) {
      this.logger.error('AuthDriver: Token refresh error', {error: (error as Error).message});
      return err(new Error(`Auth refresh error: ${(error as Error).message}`));
    }
  }

  /**
   * Logout a user
   */
  async logout(
    accessToken: string,
  ): Promise<Result<boolean, Error>> {
    try {
      this.logger.debug('AuthDriver: User logout attempt');
      // Set the auth header for the client
      const client = this.supabase.getAnonClient();
      client.auth.setSession({access_token: accessToken, refresh_token: ''});

      const {error} = await client.auth.signOut();

      if (error) {
        this.logger.error('AuthDriver: Logout failed', {error: error.message});
        return err(new Error(`Auth logout failed: ${error.message}`));
      }

      this.logger.debug('AuthDriver: User logged out successfully');
      return ok(true);
    } catch (error) {
      this.logger.error('AuthDriver: Logout error', {error: (error as Error).message});
      return err(new Error(`Auth logout error: ${(error as Error).message}`));
    }
  }

  /**
   * Get current user profile using service role key
   */
  async getProfile(userId: string): Promise<Result<User, Error>> {
    try {
      this.logger.debug('AuthDriver: Getting user profile', {userId});
      // Use service client for enhanced permissions
      const {data, error} = await this.supabase.getServiceClient().auth.admin.getUserById(userId);

      if (error) {
        this.logger.error('AuthDriver: Get profile failed', {userId, error: error.message});
        return err(new Error(`Get profile failed: ${error.message}`));
      }

      if (!data.user) {
        this.logger.error('AuthDriver: Get profile failed - user not found', {userId});
        return err(new Error('Get profile failed: User not found'));
      }

      this.logger.debug('AuthDriver: Got user profile successfully', {userId});
      return ok({
        id: data.user.id,
        email: data.user.email || '',
        username: data.user.user_metadata.username as string | undefined,
        full_name: data.user.user_metadata.full_name as string | undefined,
        avatar_url: data.user.user_metadata.avatar_url as string | undefined | null,
        role: data.user.user_metadata.role as 'user' | 'admin',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || '',
      });
    } catch (error) {
      this.logger.error('AuthDriver: Get profile error', {userId, error: (error as Error).message});
      return err(new Error(`Get profile error: ${(error as Error).message}`));
    }
  }
}

export const createAuthDriver = (options: AuthDriverOptions): AuthDriver => {
  return new AuthDriver(options);
};
