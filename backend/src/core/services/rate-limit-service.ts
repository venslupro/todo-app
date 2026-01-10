// core/services/rate-limit-service.ts
// import {HttpErrors} from '../../shared/errors/http-errors';
import {SupabaseClient} from '../../shared/supabase/client';

/**
 * 速率限制服务
 * 基于Supabase实现分布式速率限制
 */
export class RateLimitService {
  private supabase: ReturnType<typeof SupabaseClient.getClient>;

  constructor(env: any) {
    this.supabase = SupabaseClient.getClient(env);
  }

  /**
   * 检查速率限制
   */
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{allowed: boolean; remaining: number; reset: number}> {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;

    try {
      // 清理过期记录
      await this.supabase
        .from('rate_limits')
        .delete()
        .lt('timestamp', windowStart)
        .eq('identifier', identifier);

      // 获取当前窗口内的请求数
      const {data: requests, error: countError} = await this.supabase
        .from('rate_limits')
        .select('id', {count: 'exact'})
        .eq('identifier', identifier)
        .gte('timestamp', windowStart);

      if (countError) {
        console.error('Rate limit count error:', countError);
        // 如果查询失败，出于安全考虑允许请求
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

      // 记录本次请求
      const {error: insertError} = await (this.supabase as any).from('rate_limits').insert({
        identifier,
        timestamp: now,
      });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
      }

      return {
        allowed: true,
        remaining: limit - currentCount - 1,
        reset: now + windowSeconds,
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // 如果出现异常，出于安全考虑允许请求
      return {allowed: true, remaining: limit, reset: now + windowSeconds};
    }
  }

  /**
   * 检查API密钥速率限制
   */
  async checkApiKeyRateLimit(apiKey: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - 3600; // 1小时窗口

    try {
      // 检查API密钥是否存在且有效
      const {data: keyData} = await this.supabase
        .from('api_keys')
        .select('rate_limit, is_active')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (!keyData) {
        return false;
      }

      // 获取当前窗口内的请求数
      const {data: requests} = await this.supabase
        .from('api_key_requests')
        .select('id', {count: 'exact'})
        .eq('api_key', apiKey)
        .gte('timestamp', windowStart);

      const currentCount = requests?.length || 0;

      if (currentCount >= (keyData as any).rate_limit) {
        return false;
      }

      // 记录本次请求
      await (this.supabase as any).from('api_key_requests').insert({
        api_key: apiKey,
        timestamp: now,
      });

      return true;
    } catch (error) {
      console.error('API key rate limit error:', error);
      return false;
    }
  }
}
