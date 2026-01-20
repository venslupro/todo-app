// src/drivers/supabase.ts
// Base Supabase driver for managing database connections

import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {Logger} from '../../../shared/utils/logger';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  logger: Logger;
}

export class SupabaseDriver {
  private anonClient: SupabaseClient;
  private serviceClient: SupabaseClient;
  private logger: Logger;

  constructor(config: SupabaseConfig) {
    this.logger = config.logger;
    this.logger.debug('SupabaseDriver: Initializing Supabase clients');
    this.anonClient = createClient(config.url, config.anonKey);
    this.serviceClient = createClient(config.url, config.serviceRoleKey);
    this.logger.debug('SupabaseDriver: Supabase clients initialized successfully');
  }

  /**
   * Get the anonymous client for regular operations
   */
  getAnonClient(): SupabaseClient {
    this.logger.debug('SupabaseDriver: Getting anonymous client');
    return this.anonClient;
  }

  /**
   * Get the service client for admin operations
   */
  getServiceClient(): SupabaseClient {
    this.logger.debug('SupabaseDriver: Getting service client');
    return this.serviceClient;
  }
}

export const createSupabaseDriver = (config: SupabaseConfig): SupabaseDriver => {
  return new SupabaseDriver(config);
};
