// shared/types/hono-types.ts

/**
 * 用户信息类型别名
 */
export type UserInfo = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
};

/**
 * Hono 应用类型别名 - 符合Google Code Style的行长度限制
 */
export type HonoAppType = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_ANON_KEY: string;
    ENVIRONMENT: 'development' | 'production' | 'staging';
  };
  Variables: {
    user: UserInfo;
  };
};