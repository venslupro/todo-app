/**
 * Environment variable keys used throughout the application.
 */
const ENV_KEYS = {
  NAME: 'name',
  ENVIRONMENT: 'environment',
  SUPABASE_URL: 'supabase_url',
  SUPABASE_ANON_KEY: 'supabase_anon_key',
  SUPABASE_SERVICE_ROLE_KEY: 'supabase_service_role_key',
  LOG_LEVEL: 'log_level',
} as const;

export interface EnvironmentVariables {
  [ENV_KEYS.NAME]?: string;
  [ENV_KEYS.ENVIRONMENT]?: string;
  [ENV_KEYS.SUPABASE_URL]?: string;
  [ENV_KEYS.SUPABASE_ANON_KEY]?: string;
  [ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY]?: string;
  [ENV_KEYS.LOG_LEVEL]?: string;
  [key: string]: unknown;
}

/**
 * Available log levels for application logging.
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Application environment types.
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
}

/**
 * Interface for configuration objects that require validation.
 */
export interface Config {
  /**
   * Validates the configuration object.
   * @throws {ConfigValidationException} When validation fails
   */
  validate(): void;
}

/**
 * Common application configuration containing basic application settings.
 */
export class CommonConfig implements Config {
  private name: string;
  private environment: Environment;
  private logLevel: LogLevel;
  /**
   * Creates a new CommonConfig instance.
   * @param name - Application name
   * @param environment - Application environment
   * @param logLevel - Logging level
   */
  constructor(
    name: string = '',
    environment: Environment = Environment.DEVELOPMENT,
    logLevel: LogLevel = LogLevel.DEBUG,
  ) {
    this.name = name;
    this.environment = environment;
    this.logLevel = logLevel;
  }

  public validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('application name is invalid');
    }

    if (!Object.values(Environment).includes(this.environment)) {
      throw new Error(
        `environment is invalid, must be one of ${Object.values(Environment).join(', ')}`,
      );
    }

    if (!Object.values(LogLevel).includes(this.logLevel)) {
      throw new Error(`log level is invalid, must be one of ${Object.values(LogLevel).join(', ')}`);
    }
  }
}


/**
 * Supabase configuration containing database connection settings.
 */
export class SupabaseConfig implements Config {
  private url: string;
  private anonKey: string;
  private serviceRoleKey: string;

  /**
   * Creates a new SupabaseConfig instance.
   * @param url - Supabase project URL
   * @param anonKey - Supabase anonymous key
   * @param serviceRoleKey - Supabase service role key
   */
  constructor(
    url: string = '',
    anonKey: string = '',
    serviceRoleKey: string = '',
  ) {
    this.url = url;
    this.anonKey = anonKey;
    this.serviceRoleKey = serviceRoleKey;
  }

  /**
   * Gets the Supabase URL.
   */
  public getUrl(): string {
    return this.url;
  }

  /**
   * Gets the Supabase anonymous key.
   */
  public getAnonKey(): string {
    return this.anonKey;
  }

  /**
   * Gets the Supabase service role key.
   */
  public getServiceRoleKey(): string {
    return this.serviceRoleKey;
  }

  public validate(): void {
    if (!this.url || typeof this.url !== 'string') {
      throw new Error('supabase url is invalid');
    }

    if (!this.anonKey || typeof this.anonKey !== 'string') {
      throw new Error('supabase anonymous key is invalid');
    }

    if (!this.serviceRoleKey || typeof this.serviceRoleKey !== 'string') {
      throw new Error('supabase service role key is invalid');
    }

    try {
      new URL(this.url);
    } catch {
      throw new Error('supabase url is invalid URL format');
    }
  }
}


/**
 * Main application configuration that aggregates all configuration sections.
 */
export class AppConfig implements Config {
  private common: CommonConfig;
  private supabase: SupabaseConfig;

  constructor(env: EnvironmentVariables) {
    this.common = new CommonConfig(
      env[ENV_KEYS.NAME],
      env[ENV_KEYS.ENVIRONMENT] as Environment,
      env[ENV_KEYS.LOG_LEVEL] as LogLevel,
    );
    this.supabase = new SupabaseConfig(
      env[ENV_KEYS.SUPABASE_URL],
      env[ENV_KEYS.SUPABASE_ANON_KEY],
      env[ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY],
    );
  }

  public validate(): void {
    this.common.validate();
    this.supabase.validate();
  }

  public getCommon(): CommonConfig {
    return this.common;
  }

  public getSupabase(): SupabaseConfig {
    return this.supabase;
  }
}

