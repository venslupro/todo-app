import {ErrorCode, Result, okResult, errResult} from '../../shared/errors/error-codes';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../supabase/client';
import {User, AuthResult, Register, Login} from '../models/user';
import {AppConfig} from '../../shared/config/app-config';

/**
 * Authentication service class.
 */
export class AuthService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(config: AppConfig) {
    this.supabase = SupabaseClient.getClient(config);
  }

  /**
   * User registration
   */
  async register(dto: Register): Promise<Result<AuthResult, ErrorCode>> {
    const emailResult = Validator.validateEmail(dto.email);
    if (emailResult.isErr()) {
      return errResult(emailResult.error);
    }
    const email = emailResult.value;

    const passwordResult = Validator.validatePassword(dto.password);
    if (passwordResult.isErr()) {
      return errResult(passwordResult.error);
    }

    const {data, error} = await this.supabase.auth.signUp({
      email,
      password: dto.password,
      options: {
        data: {
          username: dto.username,
          full_name: dto.full_name,
        },
      },
    });

    if (error) {
      if (error.message.includes('Email address') || error.message.includes('email')) {
        return errResult(ErrorCode.AUTH_EMAIL_EXISTS);
      }
      return errResult(ErrorCode.VALIDATION_INVALID_EMAIL);
    }

    if (!data.user) {
      return errResult(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

    return okResult({
      user: {
        id: data.user.id,
        email: data.user.email!,
        username: dto.username,
        full_name: dto.full_name,
        avatar_url: undefined,
        role: 'user' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      session: {
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in || 3600,
      },
    });
  }

  /**
   * User login
   */
  async login(dto: Login): Promise<Result<AuthResult, ErrorCode>> {
    const emailResult = Validator.validateEmail(dto.email);
    if (emailResult.isErr()) {
      return errResult(emailResult.error);
    }
    const email = emailResult.value;

    // For login, we should be more lenient with password validation
    // and return authentication errors instead of validation errors
    if (!dto.password || typeof dto.password !== 'string' || dto.password.trim().length === 0) {
      return errResult(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
    
    const password = dto.password.trim();

    const {data, error} = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return errResult(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    if (!data.user) {
      return errResult(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    return okResult({
      user: {
        id: data.user.id,
        email: data.user.email!,
        username: data.user.user_metadata?.['username'],
        full_name: data.user.user_metadata?.['full_name'],
        avatar_url: data.user.user_metadata?.['avatar_url'],
        role: 'user' as any,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: data.user.updated_at || new Date().toISOString(),
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    });
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<Result<AuthResult, ErrorCode>> {
    if (!refreshToken) {
      return errResult(ErrorCode.VALIDATION_REQUIRED_FIELD);
    }

    const {data, error} = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return errResult(ErrorCode.AUTH_TOKEN_INVALID);
    }

    const {data: {user}} = await this.supabase.auth.getUser(data.session.access_token);

    if (!user) {
      return errResult(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    return okResult({
      user: {
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.['username'],
        full_name: user.user_metadata?.['full_name'],
        avatar_url: user.user_metadata?.['avatar_url'],
        role: 'user' as any,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    });
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    const {error} = await this.supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      // Don't throw error, logout failure doesn't affect user
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(accessToken: string): Promise<Result<User, ErrorCode>> {
    const {data: {user}, error} = await this.supabase.auth.getUser(accessToken);

    if (error || !user) {
      return errResult(ErrorCode.AUTH_TOKEN_INVALID);
    }

    return okResult({
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.['username'],
      full_name: user.user_metadata?.['full_name'],
      avatar_url: user.user_metadata?.['avatar_url'],
      role: 'user' as any,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    });
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<Result<User, ErrorCode>> {
    return this.getCurrentUser(token);
  }
}
