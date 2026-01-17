import {createClient} from '@supabase/supabase-js';
import type {Database} from './database.types';
import {AppConfig} from '../../shared/config/app-config';

/**
 * Supabase client manager.
 * Uses caching mechanism to ensure client instances with same configuration are reused.
 */
export class SupabaseClient {
  private static clientCache = new Map<string, ReturnType<typeof createClient<Database>>>();
  private static serviceClientCache = new Map<string, ReturnType<typeof createClient<Database>>>();

  /**
   * Generates cache key for client instances.
   */
  private static generateCacheKey(url: string, key: string): string {
    return `${url}-${key}`;
  }

  /**
   * Gets anonymous client for frontend calls.
   */
  public static getClient(config: AppConfig): ReturnType<typeof createClient<Database>> {
    if (!config || typeof config.getSupabase !== 'function') {
      throw new Error('Invalid config object provided to SupabaseClient.getClient');
    }
    const supabaseConfig = config.getSupabase();
    const cacheKey = this.generateCacheKey(
      supabaseConfig.getUrl(),
      supabaseConfig.getAnonKey(),
    );

    if (!this.clientCache.has(cacheKey)) {
      const client = createClient<Database>(
        supabaseConfig.getUrl(),
        supabaseConfig.getAnonKey(),
        {
          auth: {
            persistSession: false,
            autoRefreshToken: true,
          },
        },
      );
      this.clientCache.set(cacheKey, client);
    }

    return this.clientCache.get(cacheKey)!;
  }

  /**
   * Gets service role client for backend management.
   */
  public static getServiceClient(config: AppConfig): ReturnType<typeof createClient<Database>> {
    if (!config || typeof config.getSupabase !== 'function') {
      throw new Error('Invalid config object provided to SupabaseClient.getServiceClient');
    }
    const supabaseConfig = config.getSupabase();
    const cacheKey = this.generateCacheKey(
      supabaseConfig.getUrl(),
      supabaseConfig.getServiceKey(),
    );

    if (!this.serviceClientCache.has(cacheKey)) {
      const client = createClient<Database>(
        supabaseConfig.getUrl(),
        supabaseConfig.getServiceKey(),
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
   * Resets client instances (mainly for testing).
   */
  public static reset(): void {
    this.clientCache.clear();
    this.serviceClientCache.clear();
  }
}

