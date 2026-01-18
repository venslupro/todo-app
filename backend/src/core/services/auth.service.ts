import { AuthDriver, SupabaseDriver } from '../../drivers/supabase';
import { User, AuthResponse } from '../model/auth';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../../shared/types/auth';
import { AppException } from '../../shared/exceptions/app.exception';

export class AuthService {
  private readonly authDriver: AuthDriver;

  constructor(supabaseDriver: SupabaseDriver) {
    this.authDriver = new AuthDriver(supabaseDriver);
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const result = await this.authDriver.register(
      request.email,
      request.password,
      {
        username: request.username,
        fullName: request.fullName,
      },
    );

    if (!result.user || !result.session) {
      throw AppException.internalError('Registration failed');
    }

    return {
      user: this.mapUser(result.user),
      session: {
        accessToken: result.session.access_token,
        refreshToken: result.session.refresh_token || '',
        expiresIn: result.session.expires_in,
      },
    };
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const result = await this.authDriver.login(request.email, request.password);

    if (!result.user || !result.session) {
      throw AppException.unauthorized('Invalid credentials');
    }

    return {
      user: this.mapUser(result.user),
      session: {
        accessToken: result.session.access_token,
        refreshToken: result.session.refresh_token || '',
        expiresIn: result.session.expires_in,
      },
    };
  }

  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    const result = await this.authDriver.refreshToken(request.refreshToken);

    if (!result.user || !result.session) {
      throw AppException.unauthorized('Invalid refresh token');
    }

    return {
      user: this.mapUser(result.user),
      session: {
        accessToken: result.session.access_token,
        refreshToken: result.session.refresh_token || '',
        expiresIn: result.session.expires_in,
      },
    };
  }

  async logout(accessToken: string): Promise<void> {
    await this.authDriver.logout(accessToken);
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    const user = await this.authDriver.getUser(accessToken);
    if (!user) {
      throw AppException.unauthorized('Invalid access token');
    }
    return this.mapUser(user);
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
}
