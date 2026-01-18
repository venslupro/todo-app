// shared/types/hono-types.ts

/**
 * Environment configuration type - only includes required environment variables
 */
export type EnvironmentConfig = {
  supabase_url: string;
  supabase_service_role_key: string;
  supabase_anon_key: string;
  environment: 'development' | 'production' | 'staging';
};

/**
 * User information type extracted from JWT token
 */
export type UserInfo = {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
};

/**
 * Hono application type with optimized bindings and variables
 * Only includes required bindings and variables to reduce redundancy
 */
export type HonoAppType = {
  Bindings: EnvironmentConfig;
  Variables: {
    user: UserInfo;
  };
};

/**
 * Middleware next function type
 */
export type MiddlewareNext = () => Promise<void>;
