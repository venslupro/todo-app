// src/drivers/supabase.ts
// Base Supabase driver for managing database connections

import {createClient, SupabaseClient} from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export class SupabaseDriver {
  private anonClient: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor(config: SupabaseConfig) {
    if (!config.url) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!config.anonKey) {
      throw new Error('SUPABASE_ANON_KEY is required');
    }
    if (!config.serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    this.anonClient = createClient(config.url, config.anonKey);
    this.serviceClient = createClient(config.url, config.serviceRoleKey);
  }

  /**
   * Get the anonymous client for regular operations
   */
  getAnonClient(): SupabaseClient {
    return this.anonClient;
  }

  /**
   * Get the service client for admin operations
   */
  getServiceClient(): SupabaseClient {
    return this.serviceClient;
  }
}

export const createSupabaseDriver = (config: SupabaseConfig): SupabaseDriver => {
  return new SupabaseDriver(config);
};
