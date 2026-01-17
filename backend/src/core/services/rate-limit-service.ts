// core/services/rate-limit-service.ts
import {SupabaseClient} from '../supabase/client';
import {AppConfig} from '../../shared/config/app-config';

/**
 * Rate limiting service
 * Distributed rate limiting implementation based on Supabase
 */
export class RateLimitService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(config: AppConfig) {
    this.supabase = SupabaseClient.getClient(config);
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{allowed: boolean; remaining: number; reset: number}> {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;

    try {
      // Clean up expired records
      await this.supabase
        .from('rate_limits')
        .delete()
        .lt('window_start', new Date(windowStart * 1000).toISOString())
        .eq('ip_address', identifier);

      // Get request count in current window
      const {data: requests, error: countError} = await this.supabase
        .from('rate_limits')
        .select('id', {count: 'exact'})
        .eq('ip_address', identifier)
        .gte('window_start', new Date(windowStart * 1000).toISOString());

      if (countError) {
        // If query fails, allow request for security reasons
        return {allowed: true, remaining: limit, reset: now + windowSeconds};
      }

      const currentCount = requests?.length || 0;

      if (currentCount >= limit) {
        return {
          allowed: false,
          remaining: 0,
          reset: windowStart + windowSeconds,
        };
      }

      // Record this request
      const {error: insertError} = await this.supabase.from('rate_limits').insert({
        ip_address: identifier,
        endpoint: 'api',
        count: 1,
        window_start: new Date(windowStart * 1000).toISOString(),
        created_at: new Date().toISOString(),
      } as any);

      if (insertError) {
        // Insertion failure does not affect main logic
      }

      return {
        allowed: true,
        remaining: limit - currentCount - 1,
        reset: now + windowSeconds,
      };
    } catch (error) {
      // If exception occurs, allow request for security reasons
      return {allowed: true, remaining: limit, reset: now + windowSeconds};
    }
  }

  /**
   * Check API key rate limit
   */
  async checkApiKeyRateLimit(apiKey: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - 3600; // 1 hour window

    try {
      // Check if API key exists and is valid
      const {data: keyData} = await this.supabase
        .from('api_keys')
        .select('rate_limit, is_active')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (!keyData) {
        return false;
      }

      // Get request count in current window
      const {data: requests} = await this.supabase
        .from('api_key_requests')
        .select('id', {count: 'exact'})
        .eq('api_key', apiKey)
        .gte('timestamp', windowStart);

      const currentCount = requests?.length || 0;

      if (currentCount >= (keyData as {rate_limit: number}).rate_limit) {
        return false;
      }

      // Record this request
      await (this.supabase as any).from('api_key_requests').insert({
        api_key: apiKey,
        timestamp: now,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
