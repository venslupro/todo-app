// src/services/system.ts
// System service for handling system-related operations

import {Logger} from '../../shared/utils/logger';

interface SystemServiceOptions {
  environment: string;
  appName: string;
  appVersion: string;
  logger: Logger;
}

export class SystemService {
  private readonly environment: string;
  private readonly appName: string;
  private readonly appVersion: string;
  private readonly logger: Logger;

  constructor(options: SystemServiceOptions) {
    this.environment = options.environment;
    this.appName = options.appName;
    this.appVersion = options.appVersion;
    this.logger = options.logger;
  }

  /**
   * Get health check status
   */
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: string;
    environment: string;
  }> {
    this.logger.debug('SystemService: Getting health status');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: this.environment,
    };
  }

  /**
   * Get application version information
   */
  async getVersionInfo(): Promise<{
    name: string;
    version: string;
    environment: string;
  }> {
    this.logger.debug('SystemService: Getting version info');
    return {
      name: this.appName,
      version: this.appVersion,
      environment: this.environment,
    };
  }
}

export const createSystemService = (options: SystemServiceOptions): SystemService => {
  return new SystemService(options);
};
