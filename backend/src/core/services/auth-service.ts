import {HttpErrors} from '../../shared/errors/http-errors';
import {Validator} from '../../shared/validation/validator';
import {SupabaseClient} from '../supabase/client';
import {AppConfig} from '../../shared/config/config';
import {User, AuthResponse, RegisterDto, LoginDto} from '../models/user';

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
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Validate input
    const email = Validator.validateEmail(dto.email);
    Validator.validatePassword(dto.password);

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
      throw new HttpErrors.ValidationError(error.message);
    }

    if (!data.user) {
      throw new HttpErrors.InternalServerError('Registration failed');
    }

    return {
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
    };
  }

  /**
   * User login
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Validate input
    const email = Validator.validateEmail(dto.email);
    const password = Validator.sanitizeString(dto.password, 100);

    const {data, error} = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw new HttpErrors.UnauthorizedError('Invalid email or password');
    }

    if (!data.user) {
      throw new HttpErrors.UnauthorizedError('Invalid email or password');
    }

    return {
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
    };
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new HttpErrors.ValidationError('Refresh token is required');
    }

    const {data, error} = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      console.error('Token refresh error:', error);
      throw new HttpErrors.UnauthorizedError('Invalid refresh token');
    }

    // Get user information
    const {data: {user}} = await this.supabase.auth.getUser(data.session.access_token);

    if (!user) {
      throw new HttpErrors.UnauthorizedError('User not found');
    }

    return {
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
    };
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
  async getCurrentUser(accessToken: string): Promise<User> {
    const {data: {user}, error} = await this.supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw new HttpErrors.UnauthorizedError('Invalid or expired token');
    }

    return {
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.['username'],
      full_name: user.user_metadata?.['full_name'],
      avatar_url: user.user_metadata?.['avatar_url'],
      role: 'user' as any,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<User> {
    return this.getCurrentUser(token);
  }
}
