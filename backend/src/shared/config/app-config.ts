/**
 * Application configuration class
 */
export class AppConfig {
  public readonly supabaseUrl: string;
  public readonly supabaseServiceRoleKey: string;
  public readonly supabaseAnonKey: string;
  public readonly environment: 'development' | 'production' | 'staging';

  constructor(config: Record<string, unknown>) {
    this.supabaseUrl = this.getRequiredString(config, 'supabase_url');
    this.supabaseServiceRoleKey = this.getRequiredString(
      config,
      'supabase_service_role_key',
    );
    this.supabaseAnonKey = this.getRequiredString(
      config,
      'supabase_anon_key',
    );
    this.environment = this.getEnvironment(config);
  }

  private getRequiredString(config: Record<string, unknown>, key: string): string {
    const value = config[key];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Missing or invalid required configuration: ${key}`);
    }
    return value;
  }

  private getEnvironment(
    config: Record<string, unknown>,
  ): 'development' | 'production' | 'staging' {
    const env = config.environment || 'development';
    if (env === 'development' || env === 'production' || env === 'staging') {
      return env;
    }
    return 'development';
  }

  public isDevelopment(): boolean {
    return this.environment === 'development';
  }

  public isProduction(): boolean {
    return this.environment === 'production';
  }

  public isStaging(): boolean {
    return this.environment === 'staging';
  }

  /**
   * Gets Supabase configuration
   */
  public getSupabase(): {
    getUrl(): string;
    getAnonKey(): string;
    getServiceKey(): string;
    } {
    return {
      getUrl: () => this.supabaseUrl,
      getAnonKey: () => this.supabaseAnonKey,
      getServiceKey: () => this.supabaseServiceRoleKey,
    };
  }
}
