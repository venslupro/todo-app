// shared/types/hono-types.ts

/**
 * Supabase configuration type
 */
export type SupabaseConfig = {
  supabase_url: string;
  supabase_service_role_key: string;
  supabase_anon_key: string;
  environment: 'development' | 'production' | 'staging';
};

/**
 * User information type alias
 */
export type UserInfo = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
};

/**
 * Durable Object namespace type definition
 */
type DurableObjectNamespace = {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
};

/**
 * Durable Object ID type definition
 */
type DurableObjectId = {
  toString(): string;
};

/**
 * Durable Object Stub type definition
 */
type DurableObjectStub = {
  fetch(request: Request): Promise<Response>;
};

/**
 * Hono application type alias - Complies with Google Code Style line length limit
 */
export type HonoAppType = {
  Bindings: SupabaseConfig & {
    name: string;
    log_level?: 'error' | 'warn' | 'info' | 'debug';
    TODO_WEBSOCKET?: DurableObjectNamespace;
  };
  Variables: {
    user: UserInfo;
  };
}

/**
 * Middleware next function type
 */
export type MiddlewareNext = () => Promise<void>;
