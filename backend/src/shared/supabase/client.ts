// shared/supabase/client.ts
import {createClient} from '@supabase/supabase-js';
import type {Database} from './database.types';

/**
 * 环境变量类型定义
 */
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
}

/**
 * Supabase客户端管理器
 * 使用缓存机制确保相同配置的客户端实例被复用
 */
export class SupabaseClient {
  private static clientCache = new Map<string, ReturnType<typeof createClient<Database>>>();
  private static serviceClientCache = new Map<string, ReturnType<typeof createClient<Database>>>();

  /**
   * 生成缓存键
   */
  private static generateCacheKey(url: string, key: string): string {
    return `${url}-${key}`;
  }

  /**
   * 获取匿名客户端（用于前端调用）
   */
  public static getClient(env: Env): ReturnType<typeof createClient<Database>> {
    const cacheKey = this.generateCacheKey(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    if (!this.clientCache.has(cacheKey)) {
      const client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.clientCache.set(cacheKey, client);
    }

    return this.clientCache.get(cacheKey)!;
  }

  /**
   * 获取服务端角色客户端（用于后端管理）
   */
  public static getServiceClient(env: Env): ReturnType<typeof createClient<Database>> {
    const cacheKey = this.generateCacheKey(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    if (!this.serviceClientCache.has(cacheKey)) {
      const client = createClient<Database>(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        },
      );
      this.serviceClientCache.set(cacheKey, client);
    }

    return this.serviceClientCache.get(cacheKey)!;
  }

  /**
   * 重置客户端实例（主要用于测试）
   */
  public static reset(): void {
    this.clientCache.clear();
    this.serviceClientCache.clear();
  }
}
