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
 * Durable Object命名空间类型定义
 */
type DurableObjectNamespace = {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
};

/**
 * Durable Object ID类型定义
 */
type DurableObjectId = {
  toString(): string;
};

/**
 * Durable Object Stub类型定义
 */
type DurableObjectStub = {
  fetch(request: Request): Promise<Response>;
};

/**
 * Hono 应用类型别名 - 符合Google Code Style的行长度限制
 */
export type HonoAppType = {
  Bindings: {
    supabase_url: string;
    supabase_service_role_key: string;
    supabase_anon_key: string;
    environment: 'development' | 'production' | 'staging';
    TODO_WEBSOCKET?: DurableObjectNamespace;
  };
  Variables: {
    user: UserInfo;
  };
};
