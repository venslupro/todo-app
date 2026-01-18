import { AuthDriver, SupabaseDriver } from '../../drivers/supabase';
import { User, AuthResponse } from '../model/auth';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../../shared/types/auth';
import { ApiError } from '../../shared/types/common';

export class AuthService {
  private authDriver: AuthDriver;

  constructor(supabaseDriver: SupabaseDriver) {
    this.authDriver = new AuthDriver(supabaseDriver);
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const result = await this.authDriver.register(
        request.email,
        request.password,
        {
          username: request.username,
          fullName: request.fullName,
        }
      );

      if (!result.user || !result.session) {
        throw new Error('Registration failed');
      }

      return {
        user: this.mapUser(result.user),
        session: {
          accessToken: result.session.access_token,
          refreshToken: result.session.refresh_token || '',
          expiresIn: result.session.expires_in,
        },
      };
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const result = await this.authDriver.login(request.email, request.password);

      if (!result.user || !result.session) {
        throw new Error('Login failed');
      }

      return {
        user: this.mapUser(result.user),
        session: {
          accessToken: result.session.access_token,
          refreshToken: result.session.refresh_token || '',
          expiresIn: result.session.expires_in,
        },
      };
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      const result = await this.authDriver.refreshToken(request.refreshToken);

      if (!result.user || !result.session) {
        throw new Error('Token refresh failed');
      }

      return {
        user: this.mapUser(result.user),
        session: {
          accessToken: result.session.access_token,
          refreshToken: result.session.refresh_token || '',
          expiresIn: result.session.expires_in,
        },
      };
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async logout(accessToken: string): Promise<void> {
    try {
      await this.authDriver.logout(accessToken);
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    try {
      const user = await this.authDriver.getUser(accessToken);
      return this.mapUser(user);
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  private mapUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username,
      fullName: supabaseUser.user_metadata?.full_name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      role: supabaseUser.user_metadata?.role || 'user',
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at,
    };
  }

  private mapError(error: any): ApiError {
    if (error.status === 400) {
      return {
        code: 400,
        message: 'Bad Request',
        details: error.message,
      };
    }

    if (error.status === 401) {
      return {
        code: 401,
        message: 'Unauthorized',
        details: error.message,
      };
    }

    return {
      code: 500,
      message: 'Internal Server Error',
      details: error.message,
    };
  }
}